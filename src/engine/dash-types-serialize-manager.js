const Cast = require('../util/cast');

/**
 * @fileoverview
 * Store serializers and deserializers of custom types
 * and apply them to non-serialized values and serialized wrappers.
 */

const isValueSafeForJSON = value => (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean'
);

const isGenerator = obj => (
    typeof obj?.[Symbol.iterator] === 'function' &&
    typeof obj?.next === 'function'
);

const fn4serializedWrapper = value => serialized => {
    if (Cast.isNormalArray(value)) {
        return serialized;
    } else if (Cast.isNormalObject(value)) {
        return {
            customType: false,
            serialized
        };
    } else {
        return {
            customType: true,
            typeId: value.customId,
            serialized
        };
    }
}

class TypesSerializeManager {
    /**
     * @constructor
     */
    constructor () {
        /**
         * Serializers and deserializers of custom types.
         * @type {Record<string, {serialize: Function, deserialize: Function}>}
         */
        this._serializers = {
            // Not actual a serializer of custom type, but it needed for serializing/deserializing Object/Array.
            json_json: {
                serialize: function* (obj) {
                    if (Array.isArray(obj)) {
                        const result = [];
                        for (let item of obj) {
                            result.push(yield item);
                        }
                        return result;
                    } else {
                        const result = {};
                        for (let key of obj) {
                            result[key] = yield obj[key];
                        }
                        return result;
                    }
                },
                deserialize: function* (serialized) {
                    if (Array.isArray(serialized)) {
                        const result = [];
                        for (let item of serialized) {
                            result.push(yield item);
                        }
                        return result;
                    } else {
                        const result = {};
                        for (let key of serialized) {
                            result[key] = yield serialized[key];
                        }
                        return result;
                    }
                }
            }
        };
    }

    serialize (value) {
        const actions = [];
        let go2Prev = false;
        do {
            // If go2Prev is false, then:
            // * The iteration of the current action continues and the value
            //   from the previous iteration must be serialized.
            // * The first iteration of this loop is in progress and
            //   serialization of the value is required.
            if (!go2Prev) {
                if (Cast.isNormalArray(value) || Cast.isNormalObject(value)) {
                    // If value is an Array/Object, then make action with json_json serializer.
                    actions.unshift([
                        this._serializers.json_json.serialize(value),
                        fn4serializedWrapper(value)
                    ]);
                } else if (Cast.isCustomType(value)) {
                    // If value is a custom type, then check for a serializer and make action with serializer of this type.
                    if (!(value.customId in this._serializers))
                        throw new Error(`Unknown serializer of custom type with id: ${value.customId}`);
                    actions.unshift([
                        this._serializers[value.customId].serialize(value),
                        fn4serializedWrapper(value)
                    ]);
                } else if (!isValueSafeForJSON(value)) {
                    // If value is non-safe for JSON, then convert it to string and go to previous action.
                    value = String(value);
                    go2Prev = true;
                    continue;
                } else {
                    // Is a safe value for JSON, just go to previous action.
                    go2Prev = true;
                    continue;
                }
            }
            // Reset go2Prev to false.
            go2Prev = false;

            // Get generator/value and wrapper for serialized value of the current action.
            const [gen, wrapper] = actions[0];
            if (isGenerator(gen)) {
                // If gen is a generator, then make iteration of generator.
                const resultOfNext = gen.next(value);
                if (resultOfNext.done) {
                    // Generator is done, wrap serialized value and go to previous action.
                    value = wrapper(resultOfNext.value);
                    go2Prev = true;
                    actions.splice(0, 1);
                } else {
                    value = resultOfNext.value;
                }
            } else {
                // gen is a serialized value, wrap it and go to previous action.
                value = wrapper(gen);
                go2Prev = true;
                actions.splice(0, 1);
            }
        } while (actions.length > 0)
        return value;
    }

    deserialize (value, target) {
        const actions = [];
        let go2Prev = false;
        do {
            // If go2Prev is false, then:
            // * The iteration of the current action continues and the value
            //   from the previous iteration must be deserialized.
            // * The first iteration of this loop is in progress and
            //   deserialization of the value is required.
            if (!go2Prev) {
                if (!(typeof value === "object" && value instanceof Object)) {
                    // If value is a string, number or boolean, just go to previous action.
                    go2Prev = true;
                    continue;
                } else if (Array.isArray(value)) {
                    // If value is an Array, then make action with json_json deserializer.
                    actions.unshift(this._serializers.json_json.deserialize(value, target));
                } else if ('customType' in value) {
                    if (!value.customType) {
                        // If customType prop in serialized wrapper is false -
                        // serialized value belongs to the Object, make action with json_json deserializer.
                        actions.unshift(this._serializers.json_json.deserialize(value.serialized, target));
                    } else if (value.typeId in this._serializers) {
                        // Otherwise, if serialized value belongs to the custom type and
                        // deserializer of this type exists, then make action with deserializer of this type.
                        actions.unshift(this._serializers[value.customId].deserialize(value.serialized, target));
                    } else {
                        throw new Error(`Unknown deserializer of custom type with id: ${value.customId}`);
                    }
                } else {
                    // Is a non-serialized Object, make action with json_json deserializer.
                    actions.unshift(this._serializers.json_json.deserialize(value, target));
                }
            }
            // Reset go2Prev to false.
            go2Prev = false;

            // Get generator/value of the current action.
            const gen = actions[0];
            if (isGenerator(gen)) {
                // If gen is a generator, then make iteration of generator.
                const resultOfNext = gen.next(value);
                if (resultOfNext.done) {
                    // Generator is done, go to previous action.
                    value = resultOfNext.value;
                    go2Prev = true;
                    actions.splice(0, 1);
                } else {
                    value = resultOfNext.value;
                }
            } else {
                // gen is a deserialized value, just go to previous action.
                value = gen;
                go2Prev = true;
                actions.splice(0, 1);
            }
        } while (actions.length > 0)
        return value;
    }

    registerSerializer (id, serialize, deserialize) {
        if (typeof id !== 'string') throw new TypeError('id is not a string');
        if (id === 'json_json') throw new Error('json_json is a special reserved serializer');
        if (typeof serialize !== 'function') throw new TypeError('serialize is not a function');
        if (typeof deserialize !== 'function') throw new TypeError('deserialize is not a function');
        this._serializers[id] = {serialize, deserialize};
    }
}

module.exports = TypesSerializeManager;

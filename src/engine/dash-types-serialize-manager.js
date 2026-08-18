const Cast = require('../util/cast');
const NormalArray = require('../data-types/dash-normal-array');
const NormalObject = require('../data-types/dash-normal-object');

/**
 * @fileoverview
 * Store serializers and deserializers of custom types
 * and apply them to non-serialized values and serialized wrappers.
 */

const isValueSafeForJSON = value => (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value === null
);

const isGenerator = obj => (
    typeof obj?.[Symbol.iterator] === 'function' &&
    typeof obj?.next === 'function'
);

const fn4serializedWrapper = value => serialized => {
    if (Cast.isCustomType(value)) {
        return {
            customType: true,
            typeId: value.customId,
            serialized
        };
    } else if (Array.isArray(value)) {
        return serialized;
    } else if (Cast.isNormalObject(value)) {
        return {
            customType: false,
            serialized
        };
    } else {
        return String(value);
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
            // Not actual a serializer of custom type, but it needed for serializing/deserializing Array/NormalArray/NormalObject.
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
                        for (let [key, value] of obj) {
                            result[key] = yield value;
                        }
                        return result;
                    }
                },
                deserialize: function* (serialized) {
                    if (Array.isArray(serialized)) {
                        const result = new NormalArray();
                        for (let item of serialized) {
                            result.push(yield item);
                        }
                        return result;
                    } else {
                        const result = new NormalObject();
                        for (let key in serialized) {
                            result.set(key, yield serialized[key]);
                        }
                        return result;
                    }
                }
            }
        };
    }

    serialize (value) {
        const actions = [];
        let goToPrevAction = false;
        do {
            // If goToPrevAction is false, then:
            // * The iteration of the current action continues and the value
            //   from the previous iteration must be serialized.
            // * The first iteration of this loop is in progress and
            //   serialization of the value is required.
            if (!goToPrevAction) {
                if (Cast.isCustomType(value)) {
                    // If value is a custom type, then check for a serializer and make action with serializer of this type.
                    if (!(value.customId in this._serializers))
                        throw new Error(`Unknown serializer of custom type with id: ${value.customId}`);
                    actions.unshift([
                        this._serializers[value.customId].serialize(value),
                        fn4serializedWrapper(value)
                    ]);
                } else if (Array.isArray(value) || Cast.isNormalObject(value)) {
                    // If value is an Array/NormalArray/NormalObject, then make action with json_json serializer.
                    actions.unshift([
                        this._serializers.json_json.serialize(value),
                        fn4serializedWrapper(value)
                    ]);
                } else if (!isValueSafeForJSON(value)) {
                    // If value is unsafe for JSON, then convert it to string and go to previous action.
                    value = String(value);
                    goToPrevAction = true;
                    continue;
                } else {
                    // Is a safe value for JSON, just go to previous action.
                    goToPrevAction = true;
                    continue;
                }
            }
            // Reset goToPrevAction to false.
            goToPrevAction = false;

            // Get generator/value and wrapper for serialized value of the current action.
            const [genOrVal, wrapper] = actions[0];
            if (isGenerator(genOrVal)) {
                // If genOrVal is a generator, then make iteration of generator.
                const iterResult = genOrVal.next(value);
                if (iterResult.done) {
                    // Generator is done, wrap serialized value and go to previous action.
                    value = wrapper(iterResult.value);
                    goToPrevAction = true;
                    actions.splice(0, 1);
                } else {
                    value = iterResult.value;
                }
            } else {
                // genOrVal is a serialized value, wrap it and go to previous action.
                value = wrapper(genOrVal);
                goToPrevAction = true;
                actions.splice(0, 1);
            }
        } while (actions.length > 0)
        return value;
    }

    deserialize (value, target) {
        const actions = [];
        let goToPrevAction = false;
        do {
            // If goToPrevAction is false, then:
            // * The iteration of the current action continues and the value
            //   from the previous iteration must be deserialized.
            // * The first iteration of this loop is in progress and
            //   deserialization of the value is required.
            if (!goToPrevAction) {
                if (!(typeof value === "object" && value instanceof Object)) {
                    // If value is a string, number or boolean, just go to previous action.
                    goToPrevAction = true;
                    continue;
                } else if (Array.isArray(value)) {
                    // If value is an Array, then make action with json_json deserializer.
                    actions.unshift(this._serializers.json_json.deserialize(value, target));
                } else if ('customType' in value) {
                    if (!value.customType) {
                        // If customType prop in serialized wrapper is false -
                        // serialized value belongs to the NormalObject, make action with json_json deserializer.
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
            // Reset goToPrevAction to false.
            goToPrevAction = false;

            // Get generator/value of the current action.
            const genOrVal = actions[0];
            if (isGenerator(genOrVal)) {
                // If genOrVal is a generator, then make iteration of generator.
                const iterResult = genOrVal.next(value);
                if (iterResult.done) {
                    // Generator is done, go to previous action.
                    value = iterResult.value;
                    goToPrevAction = true;
                    actions.splice(0, 1);
                } else {
                    value = iterResult.value;
                }
            } else {
                // genOrVal is a deserialized value, just go to previous action.
                value = genOrVal;
                goToPrevAction = true;
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

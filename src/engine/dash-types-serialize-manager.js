/**
 * @fileoverview
 * Store serializers and deserializers of custom types
 * and apply them to non-serialized values and serialized wrappers.
 */

const isValueSafeForJSON = value => (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    value == null
);

const isGenerator = obj => (
    typeof obj?.[Symbol.iterator] === 'function' &&
    typeof obj?.next === 'function'
);

const fn4serializedWrapper = value => serialized => {
    if (Array.isArray(value)) {
        return serialized;
    } else if (value?.constructor?.prototype === Object.prototype) {
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
            // Not actual a serializer of custom type, but it needed for serializing/deserializing Object/Array
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
        const go2Prev = false;
        do {
            if (!go2Prev) {
                if (
                    Array.isArray(value) ||
                    value?.constructor?.prototype === Object.prototype
                ) {
                    actions.unshift([
                        this._serializers.json_json.serialize(),
                        fn4serializedWrapper(value)
                    ]);
                } else if (typeof value?.customId === 'string') {
                    if (!(value.customId in this._serializers))
                        throw new Error(`Unknown serializer of custom type with id: ${value.customId}`);
                    actions.unshift([
                        this._serializers[value.customId].serialize(),
                        fn4serializedWrapper(value)
                    ]);
                } else if (!isValueSafeForJSON(value)) {
                    value = String(value);
                    go2Prev = true;
                    continue;
                } else {
                    go2Prev = true;
                    continue;
                }
            }
            go2Prev = false;
            const [gen, wrapper] = actions[0];
            if (isGenerator(gen)) {
                resultOfNext = gen.next(value);
                if (resultOfNext.done) {
                    value = wrapper(resultOfNext.value);
                    go2Prev = true;
                    actions.splice(0, 1);
                } else {
                    value = resultOfNext.value;
                }
            } else {
                value = wrapper(gen);
                go2Prev = true;
                actions.splice(0, 1);
            }
        } while (actions.length > 0)
        return value;
    }

    deserialize (value) {
        
    }

    registerSerializer (id, serialize, deserialize) {
        if (typeof id !== 'string') throw new TypeError('ID must be of type string');
        if (id === 'json_json') throw new TypeError('json_json is a special serializer');
        if (typeof serialize !== 'function') throw new TypeError('Serialize must be of type function');
        if (typeof deserialize !== 'function') throw new TypeError('Deserialize must be of type function');
        this._serializers[id] = {serialize, deserialize};
    }
}

module.exports = TypesSerializeManager;

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
            json_json: {}
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
                        this.serializers.json_json.serialize(),
                        fn4serializedWrapper(value)
                    ]);
                } else if (typeof value?.customId === 'string') {
                    if (!(value.customId in this.serializers))
                        throw new Error(`Unknown custom serializer with id: ${value.customId}`);
                    actions.unshift([
                        this.serializers[value.customId].serialize(),
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
}

module.exports = TypesSerializeManager;

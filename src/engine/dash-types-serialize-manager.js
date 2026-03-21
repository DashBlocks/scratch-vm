/**
 * @fileoverview
 * Store serializers and deserializers of custom types
 * and apply them to non-serialized and serialized values.
 */

const isValueSafeForJSON = value => (
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean'
);

class TypesSerializeManager {
    /**
     * @constructor
     */
    constructor () {
        /**
         * Serializers and deserializers of custom types.
         * @type {Record<string, {serialize: Function; deserialize: Function}>}
         */
        this._serializers = {
            // Not actual a serializer of custom type, but it needed for serializing/deserializing Object/Array
            json_json: {}
        };
    }

    serialize (value) {
        if (Array.isArray(value)) {
            const {serialize} = this.serializers.json_json;
            return serialize(value);
        } else if (value?.constructor?.prototype === Object.prototype) {
            const {serialize} = this.serializers.json_json;
            return {
                customType: false,
                serialized: serialize(value)
            };
        } else if (typeof value?.customId === 'string') {
            if (value.customId in this.serializers) {
                const {serialize} = this.serializers[value.customId];
                return {
                    customType: true,
                    typeId: value.customId,
                    serialized: serialize(value)
                };
            } else {
                throw new Error(`Unknown custom serializer with id: ${value.customId}`);
            }
        } else if (!isValueSafeForJSON(value)) {
            return String(value);
        }
        return value;
    }

    deserialize (value) {
        
    }
}

module.exports = TypesSerializeManager;

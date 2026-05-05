const Cast = require('../util/cast');

/**
 * @fileoverview
 * NormalObject class that extends Map and used in projects instead of JS Object.
 */

const prepareEntryArray = entryArray => {
    return entryArray.reduce(
        (acc, entry) => {
            if (acc.error) return acc;
            if (!Array.isArray(entry) || entry.length < 2) return {result: [], error: true};
            return {
                result: [...acc.result, [Cast.toString(entry[0]), entry[1]]],
                error: false
            };
        },
        {result: [], error: false}
    ).result;
};

class NormalObject extends Map {
    /**
     * @constructor
     */
    constructor (value) {
        if (Cast.isCustomType(value)) {
            // Convert custom types to empty NormalObject
            super();
        } else if (value instanceof NormalObject) {
            // Already a NormalObject?
            super(value);
        } else if (Cast.isNormalArray(value)) {
            // Convert array with entries to NormalObject
            super(prepareEntryArray(value));
        }
    }

    set (key, value) {
        return super.set(Cast.toString(key), value);
    }

    get (key) {
        return super.get(Cast.toString(key));
    }

    getOrInsert (key, value) {
        return super.getOrInsert(Cast.toString(key), value);
    }
}

module.exports = NormalObject;

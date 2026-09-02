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
        } else if (Cast.isNormalObject(value)) {
            // Already a NormalObject?
            super(value);
        } else if (Array.isArray(value)) {
            // Convert any array with entries to NormalObject
            super(prepareEntryArray(value));
        } else {
            // Otherwise, create empty NormalObject
            super();
        }
    }

    toReporterContent () {
        const content = document.createElement('span');
        
        if (this.size === 0) {
            content.textContent = '{}';
            return content;
        }
        
        const maxShownItems = 70;
        const more = this.size - maxShownItems;
        let currentSpan = document.createElement('span');
        content.append(currentSpan);
        
        this.entries().toArray().slice(0, maxShownItems).forEach(([key, value], i, array) => {
            if (i === 0) {
                currentSpan.textContent += '{';
            }
            currentSpan.textContent += `${JSON.stringify(key)}: `;
        
            if (Cast.isCustomType(value) || Cast.isNormalArray(value) || Cast.isNormalObject(value)) {
                if (typeof value.toReporterJSONItem === 'function') {
                    content.append(value.toReporterJSONItem());
                } else {
                    const add = document.createElement('i');
                    add.textContent = `*custom type*`;
                    content.append(add);
                }
                currentSpan = document.createElement('span');
                content.append(currentSpan);
            } else {
                currentSpan.textContent += JSON.stringify(value);
            }
        
            if (i === array.length - 1) {
                if (more > 0) {
                    currentSpan.textContent += ', ';
                    const add = document.createElement('i');
                    add.textContent = `*${more} more items*`;
                    content.append(add);
                    currentSpan = document.createElement('span');
                    content.append(currentSpan);
                }
                currentSpan.textContent += '}';
            } else {
                currentSpan.textContent += ', ';
            }
        });
        return content;
    }

    toReporterJSONItem () {
        const el = document.createElement('i');
        el.textContent = `Object(${this.size})`;
        return el;
    }

    toListEditor () {
        return `Object(${this.size})`;
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

    assign (source) {
        if (source instanceof NormalObject) {
            for (const [key, value] of source.entries()) {
                super.set(Cast.toString(key), value);
            }
        } else if (Array.isArray(source)) {
            for (let i = 0; i < source.length; i++) {
                super.set(String(i), source[i]);
            }
        } else if (typeof source === 'object' && source instanceof Object) {
            for (const key in source) {
                super.set(key, source[key]);
            }
        }
        return this;
    }
}

module.exports = NormalObject;

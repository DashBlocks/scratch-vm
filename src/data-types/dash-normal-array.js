let Cast;

/**
 * @fileoverview
 * NormalArray class that extends JS Array and used in projects.
 */

class NormalArray extends Array {
    /**
     * @constructor
     */
    constructor (value) {
        if (!Cast) Cast = require('../util/cast');
        if (Cast.isCustomType?.(value)) {
            // Convert custom types to empty NormalArray
            super();
        } else if (Array.isArray(value)) {
            // Convert any array to NormalArray
            if (value.length !== 1) {
                super(...value);
            } else {
                super();
                this[0] = value[0];
            }
        } else {
            // Otherwise, create empty NormalArray
            super();
        }
    }

    toReporterContent () {
        const content = document.createElement('span');
        
        if (this.length === 0) {
            content.textContent = '[]';
            return content;
        }
        
        const maxShownItems = 70;
        const more = this.length - maxShownItems;
        let currentSpan = document.createElement('span');
        content.append(currentSpan);
        
        this.slice(0, maxShownItems).forEach((value, i, array) => {
            if (i === 0) {
                currentSpan.textContent += '[';
            }
        
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
                currentSpan.textContent += ']';
            } else {
                currentSpan.textContent += ', ';
            }
          });
          return content;
    }

    toReporterJSONItem () {
        const el = document.createElement('i');
        el.textContent = `Array(${this.length})`;
        return el;
    }

    toListEditor () {
        return `Array(${this.length})`;
    }
}

module.exports = NormalArray;

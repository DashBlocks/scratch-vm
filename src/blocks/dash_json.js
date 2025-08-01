const Cast = require('../util/cast');

class DashJSONBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            json_array_empty: this.arrayEmpty,
            json_array_item_of: this.arrayItemOf,
            json_array_item_no_of: this.arrayItemNoOf,
            json_array_contains: this.arrayContains,
            json_array_length: this.arrayLength,
            json_array_in_front_of: this.arrayAddFront,
            json_array_behind: this.arrayAddBack,
            json_array_at: this.arrayInsertAt,
            json_array_split: this.arraySplit
        };
    }

    arrayEmpty () {
        return [];
    }

    arrayItemOf (args) {
        const array = Cast.toList(args.VALUE);
        const index = Cast.toNumber(args.INDEX) - 1;
        return array[index] || '';
    }

    arrayItemNoOf (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.VALUE;
        return array && item ? array.indexOf(item) + 1 : 0;
    }

    arrayContains (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.VALUE;
        return array ? array.includes(item) : false;
    }

    arrayLength (args) {
        const array = Cast.toList(args.VALUE);
        return array ? array.length : 0;
    }

    arrayAddFront (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.ITEM;
        return array && item ? [...array, item] : item ? item : '';
    }

    arrayAddBack (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.ITEM;
        return array && item ? [item, ...array] : item ? item : '';
    }

    arrayInsertAt (args) {
        const array = Cast.toList(args.ARRAY);
        const index = Cast.toNumber(args.INDEX) - 1;
        const item = args.ITEM;
        const newArray = array ? [...array] : null;
        if (!newArray) return item;
        newArray.splice(index, 0, item);
        return newArray;
    }

    arraySplit (args) {
        const text = Cast.toString(args.TEXT);
        const delimiter = Cast.toString(args.DELIM);
        return text.split(delimiter);
    }
}

module.exports = DashJSONBlocks;

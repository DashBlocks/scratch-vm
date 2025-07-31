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
        return array.indexOf(item) + 1;
    }

    arrayContains (args) {
        const array = Cast.toList(args.VALUE);
        const item = args.ARRAY;
        return array.includes(item);
    }

    arrayLength (args) {
        const array = Cast.toList(args.VALUE);
        return array.length;
    }

    arrayAddFront (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.ITEM;
        return [...array, item];
    }

    arrayAddBack (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.ITEM;
        return [item, ...array];
    }

    arrayInsertAt (args) {
        const array = Cast.toList(args.ARRAY);
        const index = Cast.toNumber(args.INDEX) - 1;
        const item = args.ITEM;
        const newArray = [...array];
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

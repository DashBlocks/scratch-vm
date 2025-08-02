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
            json_array_split: this.arraySplit,
            json_array_delete: this.arrayDelete,
            json_array_replace: this.arrayReplace
        };
    }

    arrayEmpty () {
        return [];
    }

    arrayItemOf (args) {
        const array = Cast.toList(args.VALUE);
        const index = Cast.toListIndex(args.INDEX, array.length, false);
        if (index === Cast.LIST_INVALID) {
            return '';
        }
        return array[index - 1];
    }

    arrayItemNoOf (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.VALUE;
        return array.indexOf(item) + 1;
    }

    arrayContains (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.VALUE;
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
        const index = Cast.toListIndex(args.INDEX, array.length, false);
        const item = args.ITEM;
        if (index === Cast.LIST_INVALID) {
            return array;
        }
        return array.toSpliced(index - 1, 0, item);
    }

    arraySplit (args) {
        const text = Cast.toString(args.TEXT);
        const delimiter = Cast.toString(args.DELIM);
        return text.split(delimiter);
    }

    arrayDelete (args) {
        const array = Cast.toList(args.ARRAY);
        const index = Cast.toListIndex(args.INDEX, array.length, true);
        const item = args.ITEM;
        if (index === Cast.LIST_ALL) {
            return [];
        } else if (index === Cast.LIST_INVALID) {
            return array;
        }
        return array.toSpliced(index - 1, 1);
    }

    arrayReplace (args) {
        const array = Cast.toList(args.ARRAY);
        const index = Cast.toListIndex(args.INDEX, array.length, false);
        const item = args.ITEM;
        if (index === Cast.LIST_INVALID) {
            return array;
        }
        array[index] = item;
        return array;
    }
}

module.exports = DashJSONBlocks;

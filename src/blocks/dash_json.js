/*
 * Some of blocks clearly inspired to AmpMod's blocks from Arrays category
 * codeberg.org/ampmod/ampmod/src/branch/develop/packages/vm/src/blocks/ampmod_arrays.ts
 */

const Cast = require('../util/cast');
const ExtendedJSON = require('@turbowarp/json');

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
            json_contains: this.contains,
            json_length: this.length,
            json_get_by_path: this.getByPath,
            json_set_by_path: this.setByPath,
            json_stringify_spacer: this.stringifySpacer,
            json_assign: this.assign,
            json_array_in_front_of: this.arrayAddFront,
            json_array_behind: this.arrayAddBack,
            json_array_at: this.arrayInsertAt,
            json_array_split: this.arraySplit,
            json_array_delete: this.arrayDelete,
            json_array_replace: this.arrayReplace,
            json_array_expandable: this.arrayExpandable,
            json_object_empty: this.objectEmpty,
            json_object_split: this.objectSplit,
            json_object_item_of: this.objectItemOf,
            json_object_contains_key: this.objectContainsKey,
            json_object_set: this.objectSet,
            json_object_delete: this.objectDelete,
            json_object_entries: this.objectEntries,
            json_array_includes: this.arrayIncludes
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

    contains (args) {
        const json = Cast.toJSON(args.JSON, true);
        const item = args.VALUE;
        return Array.isArray(json) ? json.includes(item) : Object.values(json).includes(item);
    }

    length (args) {
        const json = Cast.toJSON(args.VALUE, true);
        return Array.isArray(json) ? json.length : Object.keys(json).length;
    }

    getByPath (args) {
        const path = Cast.toList(args.PATH);
        const json = Cast.toJSON(args.VALUE, true);
        let pathExist = true;
        const result = path.reduce((acc, key) => {
            if (!pathExist) return;
            if (Array.isArray(acc)) {
                key = Cast.toListIndex(key, acc.length, false);
                if (key === Cast.LIST_INVALID) {
                    pathExist = false;
                    return;
                }
                return acc[key - 1];
            } else if (typeof acc === 'object' && acc instanceof Object) {
                key = Cast.toString(key);
                if (!(key in acc)) {
                    pathExist = false;
                    return;
                }
                return acc[key];
            } else {
                pathExist = false;
                return;
            }
        }, json);
        return pathExist ? result : '';
    }

    setByPath (args) {
        const path = Cast.toList(args.PATH);
        const json = Cast.toJSON(args.VALUE, true);
        let newJson = Array.isArray(json) ? [...json] : {...json};
        let pathExist = true;
        const result = path.reduce(([full, part], key, i) => {
            if (!pathExist) return;
            if (Array.isArray(part)) {
                key = Cast.toListIndex(key, part.length, false);
                if (key === Cast.LIST_INVALID) {
                    pathExist = false;
                    return;
                }
                if (i < path.length - 1 && !(typeof part[key - 1] === 'object' && part[key - 1] instanceof Object)) {
                    pathExist = false;
                    return;
                }
                part[key - 1] = i < path.length - 1
                    ? Array.isArray(part[key - 1]) ? [...part[key - 1]] : {...part[key - 1]}
                    : args.ITEM;
                return [full, part[key - 1]];
            } else if (typeof part === 'object' && part instanceof Object) {
                key = Cast.toString(key);
                if (!(key in part)) {
                    pathExist = false;
                    return;
                }
                if (i < path.length - 1 && !(typeof part[key] === 'object' && part[key] instanceof Object)) {
                    pathExist = false;
                    return;
                }
                part[key] = i < path.length - 1
                    ? Array.isArray(part[key]) ? [...part[key]] : {...part[key]}
                    : args.ITEM;
                return [full, part[key]];
            } else {
                pathExist = false;
                return;
            }
        }, [newJson, newJson]);
        return pathExist ? result[0] : json;
    }

    stringifySpacer (args) {
        const json = Cast.toJSON(args.VALUE, true);
        return ExtendedJSON.stringify(json, null, args.SPACER);
    }

    assign (args) {
        const main = Cast.toJSON(args.MAIN, true);
        return Object.entries(args).reduce((acc, [argName, value]) =>
            argName === 'mutation' || argName === 'MAIN' ? acc : Array.isArray(acc)
                ? [...acc, ...Cast.toList(value)]
                : {...acc, ...Cast.toJSON(value, true)}, main);
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
        const index = Cast.toListIndex(args.INDEX, array.length + 1, false);
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
        return [...array.slice(0, index - 1), item, ...array.slice(index)];
    }

    arrayExpandable (args) {
        return Object.entries(args).reduce((acc, [argName, value]) => argName === 'mutation' ? acc : [...acc, value], []);
    }

    objectEmpty () {
        return {};
    }

    objectSplit (args) {
        const text = Cast.toString(args.TEXT);
        const keyDelimiter = Cast.toString(args.KEYDELIM);
        const pairDelimiter = Cast.toString(args.PAIRDELIM);
        let error = false;
        const result = text.split(pairDelimiter).reduce((acc, pair) => {
            if (!error) {
                const splitted = pair.split(keyDelimiter);
                if (splitted.length === 2) {
                    acc[splitted[0]] = splitted[1];
                    return acc;
                }
                error = true;
            }
        }, {});
        return error ? {} : result;
    }

    objectItemOf (args) {
        const object = Cast.toObject(args.VALUE);
        const key = Cast.toString(args.KEY);
        if (!Object.keys(object).includes(key)) {
            return '';
        }
        return object[key];
    }

    objectContainsKey (args) {
        const object = Cast.toObject(args.OBJECT);
        const key = Cast.toString(args.KEY);
        return Object.keys(object).includes(key);
    }

    objectSet (args) {
        const object = Cast.toObject(args.OBJECT);
        const key = Cast.toString(args.KEY);
        const item = args.ITEM;
        return {...object, [key]: item};
    }

    objectDelete (args) {
        const object = Cast.toObject(args.OBJECT);
        const key = Cast.toString(args.KEY);
        const clonedObject = {...object};
        delete clonedObject[key];
        return clonedObject;
    }

    objectEntries (args) {
        const object = Cast.toObject(args.OBJECT);
        switch (args.PROPERTY) {
            case 'entries':
                return Object.entries(object);
            case 'keys':
                return Object.keys(object);
            case 'values':
                return Object.values(object);
            default:
                return [];
        }
    }
    arrayIncludes (args) {
        const array = Cast.toList(args.ARRAY);
        return array.includes(args.VALUE)
    }
}

module.exports = DashJSONBlocks;

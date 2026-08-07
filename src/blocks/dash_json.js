/*
 * Some of blocks clearly inspired to AmpMod's blocks from Arrays category
 * codeberg.org/ampmod/ampmod/src/branch/develop/packages/vm/src/blocks/ampmod_arrays.ts
 */

const Cast = require('../util/cast');
const ExpandableBlocksUtil = require('../util/expandable-blocks-util');
const NormalArray = require('../data-types/dash-normal-array');
const NormalObject = require('../data-types/dash-normal-object');

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
            json_object_entries: this.objectEntries
        };
    }

    arrayEmpty () {
        return new NormalArray();
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
        return Array.isArray(json) ? json.includes(item) : json.values().toArray().includes(item);
    }

    length (args) {
        const json = Cast.toJSON(args.VALUE, true);
        return Array.isArray(json) ? json.length : json.size;
    }

    getByPath (args) {
        const path = Cast.toList(args.PATH);
        const json = Cast.toJSON(args.VALUE, true);
        let pathExist = true;
        const result = path.reduce((acc, key) => {
            if (!pathExist) return;
            if (Cast.isNormalArray(acc)) {
                key = Cast.toListIndex(key, acc.length, false);
                if (key === Cast.LIST_INVALID) {
                    pathExist = false;
                    return;
                }
                return acc[key - 1];
            } else if (Cast.isNormalObject(acc)) {
                key = Cast.toString(key);
                if (!acc.has(key)) {
                    pathExist = false;
                    return;
                }
                return acc.get(key);
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
        let newJson = Array.isArray(json) ? new NormalArray(json) : new NormalObject(json);
        let pathExist = true;
        const result = path.reduce(([full, part], key, i) => {
            if (!pathExist) return;
            if (Cast.isNormalArray(part)) {
                key = Cast.toListIndex(key, part.length, false);
                if (key === Cast.LIST_INVALID) {
                    pathExist = false;
                    return;
                }
                if (i < path.length - 1 && !Cast.isNormalArray(part[key - 1]) && !Cast.isNormalObject(part[key - 1])) {
                    pathExist = false;
                    return;
                }
                part[key - 1] = i < path.length - 1
                    ? Cast.isNormalArray(part[key - 1]) ? new NormalArray(part[key - 1]) : new NormalObject(part[key - 1])
                    : args.ITEM;
                return [full, part[key - 1]];
            } else if (Cast.isNormalObject(acc)) {
                key = Cast.toString(key);
                if (!part.has(key)) {
                    pathExist = false;
                    return;
                }
                if (i < path.length - 1 && !Cast.isNormalArray(part.get(key)) && !Cast.isNormalObject(part.get(key))) {
                    pathExist = false;
                    return;
                }
                part.set(key, i < path.length - 1
                    ? Cast.isNormalArray(part.get(key)) ? new NormalArray(part.get(key)) : new NormalObject(part.get(key))
                    : args.ITEM);
                return [full, part.get(key)];
            } else {
                pathExist = false;
                return;
            }
        }, [newJson, newJson]);
        return pathExist ? result[0] : json;
    }

    stringifySpacer (args) {
        const json = Cast.toJSON(args.VALUE, true);
        return JSON.stringify(json, (key, value) => {
            if (Cast.isCustomType(value)) return String(value);
            if (Cast.isNormalObject(value)) return Object.fromEntries(value.entries().toArray());
            return value;
        }, args.SPACER);
    }

    assign (args) {
        const main = Cast.toJSON(args.MAIN, true);
        const inputs = ExpandableBlocksUtil.getArgsStartedWith(args, 'INPUT');
        if (Array.isArray(main)) {
            return inputs.reduce((acc, value) => acc.concat(Cast.toList(value)), main);
        } else {
            return inputs.reduce((acc, value) => {
                value = Cast.toJSON(value, true);
                return Array.isArray(value)
                    ? value.reduce((acc, value, i) => acc.set(i, value), acc)
                    : value.entries().reduce((acc, [key, value]) => acc.set(key, value), acc)
            }, new NormalObject(main));
        }
    }

    arrayAddFront (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.ITEM;
        return array.concat([item]);
    }

    arrayAddBack (args) {
        const array = Cast.toList(args.ARRAY);
        const item = args.ITEM;
        return [item].concat(array);
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
        return new NormalArray(text.split(delimiter));
    }

    arrayDelete (args) {
        const array = Cast.toList(args.ARRAY);
        const index = Cast.toListIndex(args.INDEX, array.length, true);
        if (index === Cast.LIST_ALL) {
            return new NormalArray();
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
        return array.slice(0, index - 1).concat([item]).concat(array.slice(index));
    }

    arrayExpandable (args) {
        const inputs = ExpandableBlocksUtil.getArgsStartedWith(args, 'INPUT');
        return new NormalArray(inputs);
    }

    objectEmpty () {
        return new NormalObject();
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
                    return acc.set(...splitted);
                }
                error = true;
            }
        }, new NormalObject());
        return error ? new NormalObject() : result;
    }

    objectItemOf (args) {
        const object = Cast.toObject(args.VALUE);
        const key = Cast.toString(args.KEY);
        if (!object.has(key)) {
            return '';
        }
        return object[key];
    }

    objectContainsKey (args) {
        const object = Cast.toObject(args.OBJECT);
        const key = Cast.toString(args.KEY);
        return object.has(key);
    }

    objectSet (args) {
        const object = Cast.toObject(args.OBJECT);
        const key = Cast.toString(args.KEY);
        const item = args.ITEM;
        return new NormalObject(object).set(key, item);
    }

    objectDelete (args) {
        const object = Cast.toObject(args.OBJECT);
        const key = Cast.toString(args.KEY);
        return new NormalObject(object).delete(key);
    }

    objectEntries (args) {
        const object = Cast.toObject(args.OBJECT);
        switch (args.PROPERTY) {
            case 'entries':
                return new NormalArray(object.entries().toArray());
            case 'keys':
                return new NormalArray(object.keys().toArray());
            case 'values':
                return new NormalArray(object.values().toArray());
            default:
                return new NormalArray();
        }
    }
}

module.exports = DashJSONBlocks;

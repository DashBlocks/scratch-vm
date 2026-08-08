const Cast = require('../util/cast.js');
const ExpandableBlocksUtil = require('../util/expandable-blocks-util');
const MathUtil = require('../util/math-util.js');
const NormalArray = require('../data-types/dash-normal-array');
const NormalObject = require('../data-types/dash-normal-object');

class Scratch3OperatorsBlocks {
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
            operator_add: this.add,
            operator_subtract: this.subtract,
            operator_multiply: this.multiply,
            operator_divide: this.divide,
            operator_math_expandable: this.mathExpandable,
            operator_lt: this.lt,
            operator_equals: this.equals,
            operator_gt: this.gt,
            operator_numbers_comparator_expandable: this.numbersComparatorExpandable,
            operator_and: this.and,
            operator_or: this.or,
            operator_conditions_comparator_expandable: this.conditionsComparatorExpandable,
            operator_not: this.not,
            operator_random: this.random,
            operator_join: this.join,
            operator_joinexpandable: this.joinExpandable,
            operator_newline: this.newline,
            operator_letter_of: this.letterOf,
            operator_length: this.length,
            operator_contains: this.contains,
            operator_se_with: this.startsEndsWith,
            operator_typeof: this.typeof,
            operator_is_type: this.isType,
            operator_is_string: this.isString,
            operator_is_number: this.isNumber,
            operator_cast: this.cast,
            operator_to_case: this.toCase,
            operator_nums_in_range: this.numsInRange,
            operator_in_range: this.inRange,
            operator_mod: this.mod,
            operator_round: this.round,
            operator_mathop: this.mathop
        };
    }

    add (args) {
        return Cast.toNumber(args.NUM1) + Cast.toNumber(args.NUM2);
    }

    subtract (args) {
        return Cast.toNumber(args.NUM1) - Cast.toNumber(args.NUM2);
    }

    multiply (args) {
        return Cast.toNumber(args.NUM1) * Cast.toNumber(args.NUM2);
    }

    divide (args) {
        return Cast.toNumber(args.NUM1) / Cast.toNumber(args.NUM2);
    }

    mathExpandable (args) {
        const numbers = ExpandableBlocksUtil.getArgsStartedWith(args, 'NUM')
            .map((value) => Cast.toNumber(value));
        const menuValues = Cast.toList(args.mutation.menuvalues);
        
        let idxOfOp;
        while ((idxOfOp = menuValues.indexOf('**')) !== 1) {
            numbers.splice(idxOfOp, 2, Cast.toNumber(numbers[idxOfOp] ** numbers[idxOfOp + 1]));
            menuValues.splice(idxOfOp, 1);
        }
        while ((idxOfOp = Math.min(menuValues.indexOf('*'), menuValues.indexOf('/'))) !== 1) {
            numbers.splice(idxOfOp, 2, Cast.toNumber(
                menuValues[idxOfOp] === '*'
                    ? numbers[idxOfOp] * numbers[idxOfOp + 1]
                    : numbers[idxOfOp] / numbers[idxOfOp + 1]
            ));
            menuValues.splice(idxOfOp, 1);
        }
        while ((idxOfOp = Math.min(menuValues.indexOf('+'), menuValues.indexOf('-'))) !== 1) {
            numbers.splice(idxOfOp, 2, Cast.toNumber(
                menuValues[idxOfOp] === '+'
                    ? numbers[idxOfOp] + numbers[idxOfOp + 1]
                    : numbers[idxOfOp] - numbers[idxOfOp + 1]
            ));
            menuValues.splice(idxOfOp, 1);
        }
        
        return numbers[0];
    }

    lt (args) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) < 0;
    }

    equals (args) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) === 0;
    }

    gt (args) {
        return Cast.compare(args.OPERAND1, args.OPERAND2) > 0;
    }

    numbersComparatorExpandable (args) {
        const values = ExpandableBlocksUtil.getArgsStartedWith(args, 'STRING');
        const menuValues = Cast.toList(args.mutation.menuvalues);

        for (let i = 0; i < menuValues.length; i++) {
            if (
                !(menuValues[i] === '==' && Cast.compare(values[i], values[i + 1]) === 0) &&
                !(menuValues[i] === '>' && Cast.compare(values[i], values[i + 1]) > 0) &&
                !(menuValues[i] === '<' && Cast.compare(values[i], values[i + 1]) < 0)
            ) return false;
        }
        return true;
    }

    and (args) {
        return Cast.toBoolean(args.OPERAND1) && Cast.toBoolean(args.OPERAND2);
    }

    or (args) {
        return Cast.toBoolean(args.OPERAND1) || Cast.toBoolean(args.OPERAND2);
    }

    not (args) {
        return !Cast.toBoolean(args.OPERAND);
    }

    conditionsComparatorExpandable (args) {
        const bools = ExpandableBlocksUtil.getArgsStartedWith(args, 'BOOL')
            .map((value) => Cast.toBoolean(value));
        const menuValues = Cast.toList(args.mutation.menuvalues);

        let idxOfOp;
        while ((idxOfOp = menuValues.indexOf('&&')) !== 1) {
            bools.splice(idxOfOp, 2, bools[idxOfOp] && bools[idxOfOp + 1]);
            menuValues.splice(idxOfOp, 1);
        }
        while ((idxOfOp = menuValues.indexOf('||')) !== 1) {
            bools.splice(idxOfOp, 2, bools[idxOfOp] || bools[idxOfOp + 1]);
            menuValues.splice(idxOfOp, 1);
        }
        while ((idxOfOp = menuValues.indexOf('==')) !== 1) {
            bools.splice(idxOfOp, 2, Cast.compare(bools[idxOfOp], bools[idxOfOp + 1]) === 0);
            menuValues.splice(idxOfOp, 1);
        }
        
        return bools[0];
    }

    random (args) {
        return this._random(args.FROM, args.TO);
    }
    _random (from, to) { // used by compiler
        const nFrom = Cast.toNumber(from);
        const nTo = Cast.toNumber(to);
        const low = nFrom <= nTo ? nFrom : nTo;
        const high = nFrom <= nTo ? nTo : nFrom;
        if (low === high) return low;
        // If both arguments are ints, truncate the result to an int.
        if (Cast.isInt(from) && Cast.isInt(to)) {
            return low + Math.floor(Math.random() * ((high + 1) - low));
        }
        return (Math.random() * (high - low)) + low;
    }

    join (args) {
        return Cast.toString(args.STRING1) + Cast.toString(args.STRING2);
    }

    joinExpandable (args) {
        return ExpandableBlocksUtil.getArgsStartedWith(args, 'INPUT')
            .map((value) => Cast.toString(value)).join('');
    }

    newline () {
        return "\n";
    }

    letterOf (args) {
        const index = Cast.toNumber(args.LETTER) - 1;
        const str = Cast.toString(args.STRING);
        // Out of bounds?
        if (index < 0 || index >= str.length) {
            return '';
        }
        return str.charAt(index);
    }

    length (args) {
        return Cast.toString(args.STRING).length;
    }

    contains (args) {
        const format = function (string) {
            return Cast.toString(string).toLowerCase();
        };
        return format(args.STRING1).includes(format(args.STRING2));
    }

    startsEndsWith (args) {
        const value1 = Cast.toString(args.VALUE1);
        const value2 = Cast.toString(args.VALUE2);
        switch (args.TYPE) {
            case 'starts':
                return value1.startsWith(value2);
            case 'ends':
                return value1.endsWith(value2);
        }
    }

    typeof (args) {
        const value = args.VALUE;
        if (value === null) return 'null';
        if (Cast.isNormalArray(value)) return 'array';
        if (Cast.isCustomType(value)) {
            return new NormalObject().set("customType", true).set("typeId", value.customId);
        }
        return typeof value;
    }

    isType (args) {
        const value = args.VALUE;
        switch (args.TYPE) {
            case 'string': {
                const number = Cast.toNumber(value);
                const string = Cast.toString(value);
                if (typeof value == 'string' && number == 0 && (value != '0' && value != '-0')) {
                    if (Cast.isWhiteSpace(string)) {
                        return false;
                    } else {
                        return true;
                    }
                }
                return false;
            }
            case 'number': {
                if (typeof value == 'number') return true;
                const number = Cast.toNumber(value);
                if (number == 0 && (value != '0' && value != '-0')) {
                    return false;
                }
                return true;
            }
            case 'boolean': {
                if (typeof value == 'boolean') return true;
                const lowerCase = Cast.toString(value).toLowerCase()
                if ((lowerCase == 'true' || lowerCase == 'false') || (lowerCase == '0' || lowerCase == '1')) return true;
                return false;
            }
            case 'array':
                return Cast.isNormalArray(value);
            case 'object':
                return Cast.isNormalObject(value);
            case 'custom type':
                return Cast.isCustomType(value);
            default:
                return false;
        }
    }
    isString (args) {
        return this.isType({VALUE: args.STRING, TYPE: 'string'});
    }
    isNumber (args) {
        return this.isType({VALUE: args.NUM, TYPE: 'number'});
    }

    cast (args) {
        const value = args.VALUE;
        switch (args.TYPE) {
            case 'string':
                return Cast.toString(value);
            case 'number':
                return Cast.toNumber(value);
            case 'boolean':
                return Cast.toBoolean(value);
            case 'array':
                return Cast.toList(value);
            case 'object':
                return Cast.toObject(value);
            default:
                return value;
        }
    }

    toCase (args) {
        const value = Cast.toString(args.VALUE);
        switch (args.CASE) {
            case 'upper':
                return value.toUpperCase();
            case 'lower':
                return value.toLowerCase();
        }
    }

    numsInRange (args) {
        const from = Cast.toNumber(args.FROM);
        const to = Cast.toNumber(args.TO);
        const nums = new NormalArray();
        if (from > to) {
            return nums;
        }
        for (let i = from; i <= to; i++) {
            nums.push(i);
        }
        return nums;
    }

    inRange (args) {
        const num = Cast.toNumber(args.NUM);
        const from = Cast.toNumber(args.FROM);
        const to = Cast.toNumber(args.TO);
        const low = from <= to ? from : to;
        const high = from <= to ? to : from;
        return num >= low && num <= high;
    }

    mod (args) {
        const n = Cast.toNumber(args.NUM1);
        const modulus = Cast.toNumber(args.NUM2);
        let result = n % modulus;
        // Scratch mod uses floored division instead of truncated division.
        if (result / modulus < 0) result += modulus;
        return result;
    }

    round (args) {
        return Math.round(Cast.toNumber(args.NUM));
    }

    mathop (args) {
        const operator = Cast.toString(args.OPERATOR).toLowerCase();
        const n = Cast.toNumber(args.NUM);
        switch (operator) {
        case 'abs': return Math.abs(n);
        case 'floor': return Math.floor(n);
        case 'ceiling': return Math.ceil(n);
        case 'sqrt': return Math.sqrt(n);
        case 'sin': return Math.round(Math.sin((Math.PI * n) / 180) * 1e10) / 1e10;
        case 'cos': return Math.round(Math.cos((Math.PI * n) / 180) * 1e10) / 1e10;
        case 'tan': return MathUtil.tan(n);
        case 'asin': return (Math.asin(n) * 180) / Math.PI;
        case 'acos': return (Math.acos(n) * 180) / Math.PI;
        case 'atan': return (Math.atan(n) * 180) / Math.PI;
        case 'ln': return Math.log(n);
        case 'log': return Math.log(n) / Math.LN10;
        case 'e ^': return Math.exp(n);
        case '10 ^': return Math.pow(10, n);
        }
        return 0;
    }
}

module.exports = Scratch3OperatorsBlocks;

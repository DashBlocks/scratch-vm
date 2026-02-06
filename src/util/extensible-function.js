/**
 * Class that represent simple extensible function by "class ... extends ExtensibleFunction".
 * @type {object}
 */
class ExtensibleFunction extends Function {
    /**
     * Creates an instance of ExtensibleFunction.
     * @param {Function} func - the function for callable class.
     * @returns {object} a class instance.
     * @constructor
     */
    constructor(func) {
        return Object.setPrototypeOf(func, new.target.prototype);
    }
}

module.exports = ExtensibleFunction;

/**
 * Class that represent simple extensible function by "class ... extends ExtensibleFunction"
 * @type {object}
 */
class ExtensibleFunction extends Function {
  constructor(func) {
    return Object.setPrototypeOf(func, new.target.prototype);
  }
}

module.exports = ExtensibleFunction;

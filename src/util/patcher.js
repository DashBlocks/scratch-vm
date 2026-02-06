const ExtensibleFunction = require('./extensible-function');

class Patcher extends ExtensibleFunction {
    constructor (value) {
        if (value instanceof Patcher) return value;
        if (!(typeof value === 'function')) {
            throw new Error('value is not a function or Patcher');
        }

        super(function patcherFunc (...args) {
            return Object.getOwnPropertySymbols(patcherFunc.patches).reduce((accFunc, patchKey) => (
                patcherFunc.enablePatches[patchKey]
                    ? function (...args) {
                          return patcherFunc.patches[patchKey].call(this, accFunc.bind(this), ...args);
                      }
                    : accFunc
            ), patcherFunc.ogFunc)(...args);
        });

        this.ogFunc = value;
        this.patches = {};
        this.enabledPatches = {};
    }

    addPatch (symbol, patch, enabled = true) {
        this.patches[symbol] = patch;
        this.enabledPatches[symbol] = enabled;
    }

    removePatch (symbol) {
        delete this.patches[symbol];
        delete this.enabledPatches[symbol];
    }

    enablePatch (symbol) {
        this.enabledPatches[symbol] = true;
    }

    disablePatch (symbol) {
        this.enabledPatches[symbol] = false;
    }
}

module.exports = Patcher;

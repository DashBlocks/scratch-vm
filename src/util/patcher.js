const ExtensibleFunction = require('./extensible-function');

class Patcher extends ExtensibleFunction {
    constructor (value) {
        if (value instanceof Patcher) return value;
        if (!(typeof value === 'function')) {
            throw new Error('value is not a function or Patcher');
        }

        super(function patcherFunc (...args) {
            const patchesIds = Object.getOwnPropertySymbols(patcherFunc.patches);
            const bindedOgFunc = patcherFunc.ogFunc.bind(this);

            return patchesIds.reduce((accFunc, patchId) => (
                patcherFunc.enabledPatches[patchId]
                    ? function (...args) {
                          return patcherFunc.patches[patchId].call(this, accFunc.bind(this), ...args);
                      }
                    : accFunc
            ), bindedOgFunc)(...args);
        });

        this.ogFunc = value;
        this.patches = {};
        this.enabledPatches = {};
    }

    addPatch (id, patch, enabled = true) {
        if (!(typeof id === 'symbol')) {
            throw new Error('id is not a Symbol');
        }
        if (!(typeof patch === 'function')) {
            throw new Error('patch is not a function');
        }
        
        this.patches[id] = patch;
        this.enabledPatches[id] = enabled;
    }

    removePatch (id) {
        if (!(typeof id === 'symbol')) {
            throw new Error('id is not a Symbol');
        }
        if (!(id in this.patches)) {
            throw new Error('Unknown patch');
        }
        
        delete this.patches[id];
        delete this.enabledPatches[id];
    }

    enablePatch (id) {
        if (!(typeof id === 'symbol')) {
            throw new Error('id is not a Symbol');
        }
        if (!(id in this.patches)) {
            throw new Error('Unknown patch');
        }
        
        this.enabledPatches[id] = true;
    }

    disablePatch (id) {
        if (!(typeof id === 'symbol')) {
            throw new Error('id is not a Symbol');
        }
        if (!(id in this.patches)) {
            throw new Error('Unknown patch');
        }
        
        this.enabledPatches[id] = false;
    }
}

module.exports = Patcher;

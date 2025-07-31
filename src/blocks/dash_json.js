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
            /*json_...: this.<>*/
        };
    }

    /*...(args, util) {
        ...
    }*/
}

module.exports = DashJSONBlocks;

/**
 * These constants are copied from scratch-blocks/core/constants.js
 * @TODO find a way to require() these straight from scratch-blocks... maybe make a scratch-blocks/dist/constants.js?
 * @readonly
 * @enum {int}
 */
const ScratchBlocksConstants = {
    /**
     * ENUM for output shape: hexagonal (booleans/predicates).
     * @const
     */
    OUTPUT_SHAPE_HEXAGONAL: 1,

    /**
     * ENUM for output shape: rounded (any/all values; strings,numbers).
     * @const
     */
    OUTPUT_SHAPE_ROUND: 2,

    /**
     * ENUM for output shape: squared (arrays).
     * @const
     */
    OUTPUT_SHAPE_SQUARE: 3,

    /**
     * ENUM for output shape: plus (objects).
     * @const
     */
    OUTPUT_SHAPE_PLUS: 4
};

module.exports = ScratchBlocksConstants;

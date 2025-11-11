// Use the constants instead of manually redefining them again
const ScratchBlocksConstants = require('../engine/scratch-blocks-constants');

/**
 * Types of block shapes
 * @enum {number}
 */
const BlockShape = {
    /**
     * Output shape: hexagonal (booleans/predicates).
     */
    HEXAGONAL: ScratchBlocksConstants.OUTPUT_SHAPE_HEXAGONAL,

    /**
     * Output shape: rounded (any/all values; strings,numbers).
     */
    ROUND: ScratchBlocksConstants.OUTPUT_SHAPE_ROUND,

    /**
     * Output shape: squared (arrays).
     */
    SQUARE: ScratchBlocksConstants.OUTPUT_SHAPE_SQUARE,

    /**
     * Output shape: plus (objects).
     */
    PLUS: ScratchBlocksConstants.OUTPUT_SHAPE_PLUS
};

module.exports = BlockShape;

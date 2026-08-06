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
     * Output shape: rounded (any/all values; strings, numbers).
     */
    ROUND: ScratchBlocksConstants.OUTPUT_SHAPE_ROUND,

    /**
     * Output shape: squared (arrays).
     */
    SQUARE: ScratchBlocksConstants.OUTPUT_SHAPE_SQUARE,

    /**
     * Output shape: plus (objects).
     */
    PLUS: ScratchBlocksConstants.OUTPUT_SHAPE_PLUS,

    /**
     * Output shape: octagonal (Scratch targets).
     */
    OCTAGONAL: ScratchBlocksConstants.OUTPUT_SHAPE_OCTAGONAL,

    /**
     * Output shape: scrapped (Maps).
     */
    SCRAPPED: ScratchBlocksConstants.OUTPUT_SHAPE_SCRAPPED
};

module.exports = BlockShape;

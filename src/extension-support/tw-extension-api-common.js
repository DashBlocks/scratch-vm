const ArgumentType = require('./argument-type');
const BlockType = require('./block-type');
const BlockShape = require('./tw-block-shape');
const TargetType = require('./target-type');
const Cast = require('../util/cast');
const Patcher = require('../util/patcher');
const SandboxRunner = require('../util/sandboxed-javascript-runner');
const external = require('./tw-external');

const Scratch = {
    ArgumentType,
    BlockType,
    BlockShape,
    TargetType,
    Cast,
    Patcher,
    SandboxRunner,
    external
};

module.exports = Scratch;

const ArgumentType = require('./argument-type');
const BlockType = require('./block-type');
const BlockShape = require('./tw-block-shape');
const TargetType = require('./target-type');
const Cast = require('../util/cast');
const Patcher = require('../util/patcher');
const SandboxRunner = require('../util/sandboxed-javascript-runner');
const NormalArray = require('../data-types/dash-normal-array');
const NormalObject = require('../data-types/dash-normal-object');
const DashError = require('../data-types/dash-error');
const external = require('./tw-external');

const Scratch = {
    ArgumentType,
    BlockType,
    BlockShape,
    TargetType,
    Cast,
    NormalArray,
    NormalObject,
    DashError,
    Patcher,
    SandboxRunner,
    external
};

module.exports = Scratch;

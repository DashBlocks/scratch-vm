const Cast = require('../util/cast');

class Scratch3ControlBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * The "counter" block value. For compatibility with 2.0.
         * @type {number}
         */
        this._counter = 0; // used by compiler

        this.runtime.on('RUNTIME_DISPOSED', this.clearCounter.bind(this));
    }

    /**
     * Retrieve the block primitives implemented by this package.
     * @return {object.<string, Function>} Mapping of opcode to Function.
     */
    getPrimitives () {
        return {
            control_repeat: this.repeat,
            control_repeat_until: this.repeatUntil,
            control_while: this.repeatWhile,
            control_for_each: this.forEach,
            control_forever: this.forever,
            control_wait: this.wait,
            control_wait_until: this.waitUntil,
            control_if: this.if,
            control_if_else: this.ifElse,
            control_if_else_expandable: this.ifElseExpandable,
            control_if_then_else: this.ifThenElse,
            control_resume: this.resume,
            control_pause: this.pause,
            control_is_paused: this.isPaused,
            control_stop: this.stop,
            control_create_clone_of: this.createClone,
            // control_create_clone_with_variable: this.createCloneWithVariable,
            control_delete_this_clone: this.deleteClone,
            control_is_clone: this.isClone,
            control_get_counter: this.getCounter,
            control_incr_counter: this.incrCounter,
            control_clear_counter: this.clearCounter,
            control_all_at_once: this.allAtOnce,
            control_run_as: this.runAs
        };
    }

    getHats () {
        return {
            control_start_as_clone: {
                restartExistingThreads: false
            }
        };
    }

    repeat (args, util) {
        const times = Math.round(Cast.toNumber(args.TIMES));
        // Initialize loop
        if (typeof util.stackFrame.loopCounter === 'undefined') {
            util.stackFrame.loopCounter = times;
        }
        // Only execute once per frame.
        // When the branch finishes, `repeat` will be executed again and
        // the second branch will be taken, yielding for the rest of the frame.
        // Decrease counter
        util.stackFrame.loopCounter--;
        // If we still have some left, start the branch.
        if (util.stackFrame.loopCounter >= 0) {
            util.startBranch(1, true);
        }
    }

    repeatUntil (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        // If the condition is false (repeat UNTIL), start the branch.
        if (!condition) {
            util.startBranch(1, true);
        }
    }

    repeatWhile (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        // If the condition is true (repeat WHILE), start the branch.
        if (condition) {
            util.startBranch(1, true);
        }
    }

    forEach (args, util) {
        const variable = util.target.lookupOrCreateVariable(
            args.VARIABLE.id, args.VARIABLE.name);

        if (typeof util.stackFrame.index === 'undefined') {
            util.stackFrame.index = 0;
        }

        if (util.stackFrame.index < Number(args.VALUE)) {
            util.stackFrame.index++;
            variable.value = util.stackFrame.index;
            util.startBranch(1, true);
        }
    }

    waitUntil (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (!condition) {
            util.yield();
        }
    }

    forever (args, util) {
        util.startBranch(1, true);
    }

    wait (args, util) {
        if (util.stackTimerNeedsInit()) {
            const duration = Math.max(0, 1000 * Cast.toNumber(args.DURATION));

            util.startStackTimer(duration);
            this.runtime.requestRedraw();
            util.yield();
        } else if (!util.stackTimerFinished()) {
            util.yield();
        }
    }

    if (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (condition) {
            util.startBranch(1, false);
        }
    }

    ifElse (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (condition) {
            util.startBranch(1, false);
        } else {
            util.startBranch(2, false);
        }
    }

    ifElseExpandable (args, util) {
        const branchCount = Cast.toNumber(args.mutation.branches);
        const hasElse = Cast.toBoolean(args.mutation['ends-in-else']);
        let conditionBranchCount = hasElse ? branchCount - 1 : branchCount;

        for (let i = 1; i <= conditionBranchCount; i++) {
            const boolName = 'BOOL' + i;
            const condition = Cast.toBoolean(args[boolName]);
            if (condition) {
                util.startBranch(i, false);
                return;
            }
        }

        if (hasElse && branchCount > 0) {
            util.startBranch(branchCount, false);
        }
    }

    ifThenElse (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        return condition ? args.THEN : args.ELSE;
    }

    resume () {
        this.runtime.setPaused(false);
    }

    pause () {
        this.runtime.setPaused(true);
    }

    isPaused () {
        return this.runtime.getPaused();
    }

    stop (args, util) {
        const option = args.STOP_OPTION;
        if (option === 'all') {
            util.stopAll();
        } else if (option === 'other scripts in sprite' ||
            option === 'other scripts in stage') {
            util.stopOtherTargetThreads();
        } else if (option === 'this script') {
            util.stopThisScript();
        } else if (option === 'scripts in this target') {
            this.runtime.stopForTarget(util.target);
        }
    }

    createClone (args, util) {
        this._createClone(Cast.toString(args.CLONE_OPTION), util.target);
    }
    createCloneWithVariable (args, util) {
        this._createClone(Cast.toString(args.CLONE_OPTION), util.target, args.VARIABLE, args.VALUE);
    }
    _createClone (cloneOption, target, variableArg, variableValue) { // used by compiler
        // Set clone target
        let cloneTarget;
        if (cloneOption === '_myself_') {
            cloneTarget = target;
        } else {
            cloneTarget = this.runtime.getSpriteTargetByName(cloneOption);
        }

        // If clone target is not found, return
        if (!cloneTarget) return;

        // Create clone
        const newClone = cloneTarget.makeClone();
        if (newClone) {
            this.runtime.addTarget(newClone);

            // Place behind the original target.
            newClone.goBehindOther(cloneTarget);

            // Set variable for clone target.
            if (variableArg) {
                const variable = newClone.lookupOrCreateVariable(
                    args.VARIABLE.id, args.VARIABLE.name);
                variable.value = variableValue;
            }
        }
    }

    deleteClone (args, util) {
        if (util.target.isOriginal) return;
        this.runtime.disposeTarget(util.target);
        this.runtime.stopForTarget(util.target);
    }

    isClone (args, util) {
        return !util.target.isOriginal;
    }

    getCounter () {
        return this._counter;
    }

    clearCounter () {
        this._counter = 0;
    }

    incrCounter () {
        this._counter++;
    }

    allAtOnce (args, util) {
        util.startBranch(1, false);
        util.thread.peekStackFrame().warpMode = true;
    }

    _getTargetForRunAs (option, target) { // used by compiler
        if (option === '_myself_') {
            return target;
        } else if (option === '_stage_') {
            return this.runtime.getTargetForStage();
        } else {
            return this.runtime.getSpriteTargetByName(option);
        }
    }

    runAs (args, util) {
        // Set runner target
        const runnerTarget = this._getTargetForRunAs(Cast.toString(args.OBJECT), util.target);

        // If runner target is not found, return
        if (!runnerTarget) return;
        
        // If the runner target is not identical to the current one,
        // then target substitute is required.
        if (runnerTarget !== util.target) {
            util.thread.peekStackFrame().substituteTarget = runnerTarget;
        }
        util.startBranch(1, false);
    }
}

module.exports = Scratch3ControlBlocks;

/**
 * @fileoverview
 * DashError class that extends JS Error and used as a throwable in the blocks' code.
 */

const EXPECTED_THROWABLE = Symbol('scratch-vm/dash-error/EXPECTED_THROWABLE');

class DashError extends Error {
    /**
     * @constructor
     */
    constructor (message) {
        super(message);
        this.name = 'DashError';
    }

    static asExpectedThrowable (value) {
        return {
            value,
            [EXPECTED_THROWABLE]: true
        };
    }

    toReporterContent () {
        return document.createTextNode(`${this}`);
    }

    toReporterJSONItem () {
        const el = document.createElement('i');
        el.textContent = this.name;
        return el;
    }

    toListEditor () {
        return this.name;
    }
}

module.exports = {
    DashError,
    EXPECTED_THROWABLE
};

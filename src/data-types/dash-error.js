/**
 * @fileoverview
 * DashError class that extends JS Error and used as a throwable in the blocks' code.
 */

class DashError extends Error {
    /**
     * @constructor
     */
    constructor (message) {
        super(message);
        this.name = this.constructor.name;
    }

    toReporterContent () {
        return document.createTextNode(typeof this.message === 'string' && this.message
            ? `${this.name}: ${this.message}`
            : this.name);
    }

    toReporterJSONItem () {
        const el = document.createElement('i');
        el.textContent = this.constructor.name;
        return el;
    }

    toListEditor () {
        return this.constructor.name;
    }
}

module.exports = DashError;

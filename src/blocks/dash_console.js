const Cast = require('../util/cast');

class DashConsoleBlocks {
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
            console_clear: this.clear,
            console_addline: this.addLine,
            console_addlineandmove: this.addLineAndMove,
            console_editline: this.editLine,
            console_editsymbol: this.editSymbol,
            console_movecursor: this.moveCursor,
            console_of: this.getAttributeOf
        };
    }

    clear () {
        if (this.runtime.console) {
            this.runtime.console.clear();
        }
    }

    addLine (args) {
        if (this.runtime.console) {
            const line = Cast.toString(args.LINE);
            this.runtime.console.addLine(line, false);
        }
    }

    addLineAndMove (args) {
        if (this.runtime.console) {
            const line = Cast.toString(args.LINE);
            this.runtime.console.addLine(line, true);
        }
    }

    editLine (args) {
        if (this.runtime.console) {
            const line = Cast.toString(args.LINE);
            this.runtime.console.editLine(line);
        }
    }

    editSymbol (args) {
        if (this.runtime.console) {
            const value = Cast.toString(args.VALUE);
            this.runtime.console.editSymbol(value);
        }
    }

    moveCursor (args) {
        if (this.runtime.console) {
            const row = Cast.toListIndex(args.ROW, this.runtime.console.state.linesCount, false);
            const symbol = Cast.toListIndex(args.SYMBOL, this.runtime.console.state.symbols, false);
            if (row === Cast.LIST_INVALID || symbol === Cast.LIST_INVALID) {
                return;
            }
            this.runtime.console.props.setConsoleCursor(row - 1, symbol - 1);
        }
    }

    getAttributeOf (args) {
        if (this.runtime.console) {
            switch (args.PROPERTY) {
            case 'content': return this.runtime.console.props.lines;
            case 'linescount': return this.runtime.console.state.linesCount;
            case 'symbols': return this.runtime.console.state.symbols;
            }
        }

        // Otherwise, 0
        return 0;
    }
}

module.exports = DashConsoleBlocks;

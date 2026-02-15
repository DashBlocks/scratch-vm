const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const Cast = require('../../util/cast');

/* eslint-disable-next-line max-len */
const blockIconURI = 'data:image/svg+xml,%3Csvg id="rotate-counter-clockwise" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%233d79cc;%7D.cls-2%7Bfill:%23fff;%7D%3C/style%3E%3C/defs%3E%3Ctitle%3Erotate-counter-clockwise%3C/title%3E%3Cpath class="cls-1" d="M22.68,12.2a1.6,1.6,0,0,1-1.27.63H13.72a1.59,1.59,0,0,1-1.16-2.58l1.12-1.41a4.82,4.82,0,0,0-3.14-.77,4.31,4.31,0,0,0-2,.8,4.25,4.25,0,0,0-1.34,1.73,5.06,5.06,0,0,0,.54,4.62A5.58,5.58,0,0,0,12,17.74h0a2.26,2.26,0,0,1-.16,4.52A10.25,10.25,0,0,1,3.74,18,10.14,10.14,0,0,1,2.25,8.78,9.7,9.7,0,0,1,5.08,4.64,9.92,9.92,0,0,1,9.66,2.5a10.66,10.66,0,0,1,7.72,1.68l1.08-1.35a1.57,1.57,0,0,1,1.24-.6,1.6,1.6,0,0,1,1.54,1.21l1.7,7.37A1.57,1.57,0,0,1,22.68,12.2Z"/%3E%3Cpath class="cls-2" d="M21.38,11.83H13.77a.59.59,0,0,1-.43-1l1.75-2.19a5.9,5.9,0,0,0-4.7-1.58,5.07,5.07,0,0,0-4.11,3.17A6,6,0,0,0,7,15.77a6.51,6.51,0,0,0,5,2.92,1.31,1.31,0,0,1-.08,2.62,9.3,9.3,0,0,1-7.35-3.82A9.16,9.16,0,0,1,3.17,9.12,8.51,8.51,0,0,1,5.71,5.4,8.76,8.76,0,0,1,9.82,3.48a9.71,9.71,0,0,1,7.75,2.07l1.67-2.1a.59.59,0,0,1,1,.21L22,11.08A.59.59,0,0,1,21.38,11.83Z"/%3E%3C/svg%3E';
// let ScratchBlocks;

class ExampleDataType {
    customId = 'coreExample_datatype';

    constructor (value = 0) {
        this.value = Cast.toNumber(value);
        this.value2 = Math.random();
    }

    toMonitorContent () {
        let el = document.createElement('span');
        el.textContent = this.value;
        el.style.color = "#abffab";
        return el;
    }

    toReporterContent () {
        let el = document.createElement('span');
        el.textContent = `${this.value} (${this.value2})`;
        el.style.color = "#0088ff";
        return el;
    }

    toReporterJSONItem () {
        let el = document.createElement('span');
        el.textContent = this.value;
        el.style.color = "#0088ff";
        return el;
    }

    toListItem () {
        let el = document.createElement('span');
        el.textContent = this.value;
        el.style.color = "#abffab";
        return el;
    }

    toListEditor () {
        return `${this.value} (${this.value2})`;
    }

    get sum () {
        return this.value + this.value2;
    }
}

/**
 * An example core block implemented using the extension spec.
 * This is not loaded as part of the core blocks in the VM but it is provided
 * and used as part of tests.
 */
class DashCoreExample {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.runtime.registerSerializer(
            'coreExample_datatype',
            value => [value.value, value.value2],
            value => {
                const result = new ExampleDataType(value[0]);
                result.value2 = Cast.toNumber(value[1]);
                return result;
            }
        );

        /*
        // Create Scratch global
        const Scratch = Object.assign({}, global.Scratch || {});
        global.Scratch = Scratch;
        this.runtime.extensionManager.vm.emit('CREATE_UNSANDBOXED_EXTENSION_API', Scratch);

        // Get ScratchBlocks
        if (Scratch.gui) Scratch.gui.getScratchBlocks().then((gettedScratchBlocks) => {
            ScratchBlocks = gettedScratchBlocks;
        });
        */
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'coreExample',
            name: 'Dash Core Example', // This string does not need to be translated as this extension is only used as an example.
            blocks: [
                {
                    blockType: BlockType.XML,
                    xml: "<sep gap='6'/><label text='Warning: Don&apos;t use these blocks'/><sep gap='-12'/><label text='in real projects!'/><sep gap='24'/>",
                },
                {
                    func: 'MAKE_A_VARIABLE',
                    blockType: BlockType.BUTTON,
                    text: 'Make a Variable (example)'
                },
                {
                    opcode: 'exampleOpcode',
                    blockType: BlockType.REPORTER,
                    text: 'example block'
                },
                {
                    opcode: 'exampleWithInlineImage',
                    blockType: BlockType.COMMAND,
                    text: 'block with image [CLOCKWISE] inline',
                    arguments: {
                        CLOCKWISE: {
                            type: ArgumentType.IMAGE,
                            dataURI: blockIconURI
                        }
                    }
                },
                {
                    opcode: 'exWithCompiledPrimitive',
                    blockType: BlockType.REPORTER,
                    text: 'block with compiled primitive'
                },
                '---',
                {
                    opcode: 'exArray',
                    blockType: BlockType.ARRAY,
                    text: 'ARRAY block with ARRAY input [ARRAY]',
                    arguments: {
                        ARRAY: {
                            type: ArgumentType.ARRAY
                        }
                    }
                },
                {
                    opcode: 'exObject',
                    blockType: BlockType.OBJECT,
                    text: 'OBJECT block with OBJECT input [OBJECT]',
                    arguments: {
                        OBJECT: {
                            type: ArgumentType.OBJECT
                        }
                    }
                },
                '---',
                {
                    opcode: 'exCustomDataType',
                    blockType: BlockType.REPORTER,
                    text: 'ExampleDataType with number [NUMBER]',
                    arguments: {
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'exCustomDataTypeGetter',
                    blockType: BlockType.REPORTER,
                    text: 'sum in ExampleDataType [EXDATATYPE]'
                },
                "---",
                {
                    opcode: 'exRemoveExtension',
                    blockType: BlockType.COMMAND,
                    text: 'remove extension with id [ID]',
                    arguments: {
                        ID: {
                            type: ArgumentType.STRING
                        }
                    }
                },
                "---",
                {
                    opcode: 'exJoinExpandable',
                    blockType: BlockType.REPORTER,
                    text: 'example expandable join [REMOVE] [ADD]',
                    arguments: {
                        REMOVE: {
                            type: ArgumentType.BUTTON_EXPANDABLE_REMOVE
                        },
                        ADD: {
                            type: ArgumentType.BUTTON_EXPANDABLE_ADD
                        }
                    },
                    hideFromPalette: true,
                    afterJsonInit: function (ScratchBlocks) {
                        this.messageList = ['script ', 'block ', 'comment ', 'sprite ', 'costume ', 'backdrop ', 'sound ', 'font ', 'extension '];
                        this.inputs = 0;
                        
                        // if (!ScratchBlocks) return;
                        this.fillInBlock = ScratchBlocks.scratchBlocksUtils.generateMutatorShadow;
                        this.mutationToDom = function () {
                            const container = document.createElement('mutation');
                            container.setAttribute('inputcount', String(this.inputs_));
                            return container;
                        };
                        this.domToMutation = function (xmlElement) {
                            const inputCount = Number(xmlElement.getAttribute("inputcount"));
                            if (this.inputList.length > 1) {
                                // This was a control Z action
                                if (this.inputs_ > inputCount) {
                                    const lastInput = this.inputList[this.inputList.length - 1];
                                    const innerBlock = lastInput.connection.targetBlock();
                                    if (innerBlock.isShadow()) innerBlock.dispose();
                                    this.removeInput(lastInput.name);
                                }
                            }
                        
                            this.inputs_ = isNaN(inputCount) ? 0 : inputCount;
                            for (let i = 0; i < this.inputs_; i++) {
                                // VM will automatically replace empty inputs with saved shadows
                                if (!this.getInput(`INPUT${i + 1}`)) this.appendValueInput(`INPUT${i + 1}`);
                            }
                        };
                        this.onExpandableButtonClicked_ = function (isAdding) {
                            // Create an event group to keep field value and mutator in sync
                            // Return null at the end because setValue is called here already.
                            ScratchBlocks.Events.setGroup(true);
                            const oldMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
                            if (isAdding) {
                                this.inputs_++;
                                const number = this.inputs_;
                                const newInput = this.appendValueInput(`INPUT${number}`);
                                const text = this.messageList[number - 1];
                                this.fillInBlock(newInput.connection, "text", text ? text : "... ", "TEXT");
                            } else if (this.inputs_ > 1) {
                                this.removeInput(`INPUT${this.inputs_}`);
                                this.inputs_--;
                            }
                            this.initSvg();
                            if (this.rendered) this.render();

                            const newMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
                            ScratchBlocks.Events.fire(new ScratchBlocks.Events.BlockChange(
                                this, 'mutation', null, oldMutation, newMutation
                            ));
                            ScratchBlocks.Events.setGroup(false);
                        };
                    }
                },
                {
                    blockType: BlockType.XML,
                    xml: `
                    <block type="coreExample_exJoinExpandable">
                        <mutation inputcount="2"></mutation>
                        <value name="INPUT1">
                            <shadow type="text">
                                <field name="TEXT">script </field>
                            </shadow>
                        </value>
                        <value name="INPUT2">
                            <shadow type="text">
                                <field name="TEXT">block </field>
                            </shadow>
                        </value>
                    </block>
                    `,
                }
            ]
        };
    }

    /**
     * @returns {object} metadata for compiler.
     */
    getCompileInfo () {
        return {
            ir: {
                exWithCompiledPrimitive: (_, {InputType}) => [InputType.STRING]
            },
            js: {
                exWithCompiledPrimitive: () => '"I\'m in compiler!"'
            }
        };
    }

    exampleOpcode () {
        const stage = this.runtime.getTargetForStage();
        return stage ? stage.getName() : 'no stage yet';
    }

    exWithCompiledPrimitive () {
        return "I'm in interpreter... :/";
    }

    exArray (args) {
        return Cast.toList(args.ARRAY);
    }

    exObject (args) {
        return Cast.toObject(args.OBJECT);
    }

    exCustomDataType (args) {
        return new ExampleDataType(args.NUMBER);
    }

    exCustomDataTypeGetter (args) {
        return args.EXDATATYPE?.sum ?? 0;
    }

    exampleWithInlineImage () {
        return;
    }

    exRemoveExtension (args) {
        this.runtime.extensionManager.removeExtension(args.ID);
    }

    exJoinExpandable (args) {
        return Object.entries(args).reduce((acc, [argName, value]) => {
            if (value === null || typeof value === 'undefined') return acc;
            return acc + (argName === 'mutation' ? '' : Cast.toString(value)), '');
        }, '');
    }
}

module.exports = DashCoreExample;

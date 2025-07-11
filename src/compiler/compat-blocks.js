/**
 * @fileoverview List of blocks to be supported in the compiler compatibility layer.
 * This is only for native blocks. Extensions should not be listed here.
 */

// Please keep these lists alphabetical.

const stacked = [
    'control_if_then_else',
    'control_resume',
    'control_pause',
    'looks_changestretchby',
    'looks_hideallsprites',
    'looks_say',
    'looks_sayforsecs',
    'looks_setstretchto',
    'looks_switchbackdroptoandwait',
    'looks_think',
    'looks_thinkforsecs',
    'motion_align_scene',
    'motion_glidesecstoxy',
    'motion_glideto',
    'motion_goto',
    'motion_pointtowards',
    'motion_scroll_right',
    'motion_scroll_up',
    'sensing_alert',
    'sensing_prompt',
    'sensing_confirm',
    'sensing_askandwait',
    'sensing_setdragmode',
    'sound_changeeffectby',
    'sound_changevolumeby',
    'sound_cleareffects',
    'sound_play',
    'sound_playuntildone',
    'sound_seteffectto',
    'sound_setvolumeto',
    'sound_stopallsounds'
];

const inputs = [
    'control_if_then_else',
    'motion_xscroll',
    'motion_yscroll',
    'sensing_prompt',
    'sensing_confirm',
    'sensing_loud',
    'sensing_loudness',
    'sensing_userid',
    'sound_volume'
];

module.exports = {
    stacked,
    inputs
};

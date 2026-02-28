"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInternals = exports.Player = void 0;
const calculate_scale_1 = require("./calculate-scale");
const emitter_context_1 = require("./emitter-context");
const event_emitter_1 = require("./event-emitter");
const use_hover_state_1 = require("./use-hover-state");
const use_playback_1 = require("./use-playback");
const use_player_1 = require("./use-player");
const use_element_size_1 = require("./utils/use-element-size");
var Player_1 = require("./Player");
Object.defineProperty(exports, "Player", { enumerable: true, get: function () { return Player_1.Player; } });
exports.PlayerInternals = {
    PlayerEventEmitterContext: emitter_context_1.PlayerEventEmitterContext,
    PlayerEmitter: event_emitter_1.PlayerEmitter,
    usePlayer: use_player_1.usePlayer,
    usePlayback: use_playback_1.usePlayback,
    useElementSize: use_element_size_1.useElementSize,
    calculateScale: calculate_scale_1.calculateScale,
    useHoverState: use_hover_state_1.useHoverState,
    updateAllElementsSizes: use_element_size_1.updateAllElementsSizes,
};

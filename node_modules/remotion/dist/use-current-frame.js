"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCurrentFrame = exports.useAbsoluteCurrentFrame = void 0;
const react_1 = require("react");
const CanUseRemotionHooks_1 = require("./CanUseRemotionHooks");
const Sequence_1 = require("./Sequence");
const timeline_position_state_1 = require("./timeline-position-state");
const useAbsoluteCurrentFrame = () => {
    const timelinePosition = (0, timeline_position_state_1.useTimelinePosition)();
    return timelinePosition;
};
exports.useAbsoluteCurrentFrame = useAbsoluteCurrentFrame;
/**
 * Get the current frame of the video.
 * Frames are 0-indexed, meaning the first frame is 0, the last frame is the duration of the composition in frames minus one.
 * @link https://www.remotion.dev/docs/use-current-frame
 */
const useCurrentFrame = () => {
    const canUseRemotionHooks = (0, react_1.useContext)(CanUseRemotionHooks_1.CanUseRemotionHooks);
    if (!canUseRemotionHooks) {
        if (typeof window !== 'undefined' && window.remotion_isPlayer) {
            throw new Error(`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`);
        }
        throw new Error(`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`);
    }
    const frame = (0, exports.useAbsoluteCurrentFrame)();
    const context = (0, react_1.useContext)(Sequence_1.SequenceContext);
    const contextOffset = context
        ? context.cumulatedFrom + context.relativeFrom
        : 0;
    return frame - contextOffset;
};
exports.useCurrentFrame = useCurrentFrame;

"use strict";
// Calculate the `.currentTime` of a video or audio element
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaTime = exports.getExpectedMediaFrameUncorrected = void 0;
const interpolate_1 = require("../interpolate");
const getExpectedMediaFrameUncorrected = ({ frame, playbackRate, startFrom, }) => {
    return (0, interpolate_1.interpolate)(frame, [-1, startFrom, startFrom + 1], [-1, startFrom, startFrom + playbackRate]);
};
exports.getExpectedMediaFrameUncorrected = getExpectedMediaFrameUncorrected;
const getMediaTime = ({ fps, frame, src, playbackRate, startFrom, mediaType, }) => {
    const expectedFrame = (0, exports.getExpectedMediaFrameUncorrected)({
        frame,
        playbackRate,
        startFrom,
    });
    if (src.endsWith('webm')) {
        // For WebM videos, we need to add a little bit of shift to get the right frame.
        const msPerFrame = 1000 / fps;
        const msShift = msPerFrame / 2;
        return (expectedFrame * msPerFrame + msShift) / 1000;
    }
    if (mediaType === 'video') {
        // In Chrome, for MP4s, if 30fps, the first frame is still displayed at 0.033333
        // even though after that it increases by 0.033333333 each.
        // So frame = 0 in Remotion is like frame = 1 for the browser
        return (expectedFrame + 1) / fps;
    }
    // For audio, we don't do any shift correction
    return expectedFrame / fps;
};
exports.getMediaTime = getMediaTime;

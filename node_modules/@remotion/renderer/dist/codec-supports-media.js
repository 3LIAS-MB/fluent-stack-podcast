"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codecSupportsMedia = void 0;
const support = {
    'h264-mkv': {
        audio: true,
        video: true,
    },
    aac: {
        audio: true,
        video: false,
    },
    gif: {
        video: true,
        audio: false,
    },
    h264: {
        video: true,
        audio: true,
    },
    h265: {
        video: true,
        audio: true,
    },
    mp3: {
        audio: true,
        video: false,
    },
    prores: {
        audio: true,
        video: true,
    },
    vp8: {
        audio: true,
        video: true,
    },
    vp9: {
        audio: true,
        video: true,
    },
    wav: {
        audio: true,
        video: false,
    },
};
const codecSupportsMedia = (codec) => {
    return support[codec];
};
exports.codecSupportsMedia = codecSupportsMedia;

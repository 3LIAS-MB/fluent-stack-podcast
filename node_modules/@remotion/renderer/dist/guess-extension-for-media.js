"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessExtensionForVideo = void 0;
const execa_1 = __importDefault(require("execa"));
const guessExtensionForVideo = async (src) => {
    const { stderr } = await (0, execa_1.default)('ffprobe', [src]);
    if (stderr.includes('mp3,')) {
        return 'mp3';
    }
    if (stderr.includes('Video: vp9')) {
        return 'webm';
    }
    if (stderr.includes('Video: vp8')) {
        return 'webm';
    }
    if (stderr.includes('wav, ')) {
        return 'wav';
    }
    if (stderr.includes('Video: h264')) {
        return 'mp4';
    }
    throw new Error(`A media file ${src} which has no file extension and whose format could not be guessed. Is this a valid media file?`);
};
exports.guessExtensionForVideo = guessExtensionForVideo;

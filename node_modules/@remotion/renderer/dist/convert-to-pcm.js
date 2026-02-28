"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToPcm = void 0;
const execa_1 = __importDefault(require("execa"));
const sample_rate_1 = require("./sample-rate");
const convertToPcm = async ({ ffmpegExecutable, input, outName, }) => {
    await (0, execa_1.default)(ffmpegExecutable !== null && ffmpegExecutable !== void 0 ? ffmpegExecutable : 'ffmpeg', [
        '-i',
        input,
        '-c:a',
        'pcm_s16le',
        '-ar',
        String(sample_rate_1.DEFAULT_SAMPLE_RATE),
        outName,
    ]);
};
exports.convertToPcm = convertToPcm;

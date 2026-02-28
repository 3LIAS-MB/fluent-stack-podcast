"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSilentAudio = void 0;
const execa_1 = __importDefault(require("execa"));
const sample_rate_1 = require("./sample-rate");
const createSilentAudio = async ({ ffmpegExecutable, numberOfSeconds, outName, }) => {
    await (0, execa_1.default)(ffmpegExecutable !== null && ffmpegExecutable !== void 0 ? ffmpegExecutable : 'ffmpeg', [
        '-f',
        'lavfi',
        '-i',
        `anullsrc=r=${sample_rate_1.DEFAULT_SAMPLE_RATE}`,
        '-c:a',
        'pcm_s16le',
        '-t',
        String(numberOfSeconds),
        '-ar',
        String(sample_rate_1.DEFAULT_SAMPLE_RATE),
        outName,
    ]);
};
exports.createSilentAudio = createSilentAudio;

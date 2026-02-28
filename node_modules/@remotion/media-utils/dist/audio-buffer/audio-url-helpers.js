"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioBufferToDataUrl = void 0;
const audio_buffer_to_wav_1 = require("./audio-buffer-to-wav");
const audioBufferToDataUrl = (buffer) => {
    const wavAsArrayBuffer = (0, audio_buffer_to_wav_1.audioBufferToWav)(buffer, {
        float32: true,
    });
    let binary = '';
    const bytes = new Uint8Array(wavAsArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + window.btoa(binary);
};
exports.audioBufferToDataUrl = audioBufferToDataUrl;

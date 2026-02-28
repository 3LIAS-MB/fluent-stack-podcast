"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaveformPortion = void 0;
const get_wave_form_samples_1 = require("./get-wave-form-samples");
const getWaveformPortion = ({ audioData, startTimeInSeconds, durationInSeconds, numberOfSamples, }) => {
    const startSample = Math.floor((startTimeInSeconds / audioData.durationInSeconds) *
        audioData.channelWaveforms[0].length);
    const endSample = Math.floor(((startTimeInSeconds + durationInSeconds) / audioData.durationInSeconds) *
        audioData.channelWaveforms[0].length);
    return (0, get_wave_form_samples_1.getWaveformSamples)(audioData.channelWaveforms[0].slice(startSample, endSample), numberOfSamples).map((w, i) => {
        return {
            index: i,
            amplitude: w,
        };
    });
};
exports.getWaveformPortion = getWaveformPortion;

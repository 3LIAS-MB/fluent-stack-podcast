import type { AssetVolume } from './types';
declare type FfmpegEval = 'once' | 'frame';
declare type FfmpegVolumeExpression = {
    eval: FfmpegEval;
    value: string;
};
export declare const ffmpegVolumeExpression: ({ volume, fps, trimLeft, }: {
    volume: AssetVolume;
    trimLeft: number;
    fps: number;
}) => FfmpegVolumeExpression;
export {};

import type { AssetVolume } from './assets/types';
export declare const stringifyFfmpegFilter: ({ trimLeft, trimRight, channels, startInVideo, volume, fps, playbackRate, durationInFrames, assetDuration, }: {
    trimLeft: number;
    trimRight: number;
    channels: number;
    startInVideo: number;
    volume: AssetVolume;
    fps: number;
    durationInFrames: number;
    playbackRate: number;
    assetDuration: number | null;
}) => string | null;

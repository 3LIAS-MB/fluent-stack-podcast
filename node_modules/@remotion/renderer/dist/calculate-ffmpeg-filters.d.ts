import type { MediaAsset } from './assets/types';
export declare const calculateFfmpegFilter: ({ asset, fps, durationInFrames, channels, assetDuration, }: {
    asset: MediaAsset;
    fps: number;
    durationInFrames: number;
    channels: number;
    assetDuration: number | null;
}) => string | null;

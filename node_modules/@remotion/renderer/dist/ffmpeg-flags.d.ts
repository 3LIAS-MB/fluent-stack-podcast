export declare type FfmpegVersion = [number, number, number] | null;
export declare const getFfmpegBuildInfo: (options: {
    ffmpegExecutable: string | null;
}) => Promise<string>;
export declare const ffmpegHasFeature: ({ ffmpegExecutable, feature, isLambda, }: {
    ffmpegExecutable: string | null;
    feature: 'enable-gpl' | 'enable-libx265' | 'enable-libvpx';
    isLambda: boolean;
}) => Promise<boolean>;
export declare const parseFfmpegVersion: (buildconf: string) => FfmpegVersion;
export declare const getFfmpegVersion: (options: {
    ffmpegExecutable: string | null;
}) => Promise<FfmpegVersion>;

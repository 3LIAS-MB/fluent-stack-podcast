export declare const binaryExists: (name: 'ffmpeg' | 'brew', localFFmpeg: string | null) => Promise<boolean>;
export declare const validateFfmpeg: (customFfmpegBinary: string | null) => Promise<void>;

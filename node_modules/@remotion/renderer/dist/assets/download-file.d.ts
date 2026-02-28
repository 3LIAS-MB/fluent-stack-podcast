export declare const downloadFile: ({ onProgress, url, to: toFn, }: {
    url: string;
    to: (contentDisposition: string | null) => string;
    onProgress: ((progress: {
        percent: number | null;
        downloaded: number;
        totalSize: number | null;
    }) => void) | undefined;
}) => Promise<{
    sizeInBytes: number;
    to: string;
}>;

import type { RefObject } from 'react';
export declare const useMediaPlayback: ({ mediaRef, src, mediaType, playbackRate: localPlaybackRate, onlyWarnForMediaSeekingError, }: {
    mediaRef: RefObject<HTMLVideoElement | HTMLAudioElement>;
    src: string | undefined;
    mediaType: 'audio' | 'video';
    playbackRate: number;
    onlyWarnForMediaSeekingError: boolean;
}) => void;

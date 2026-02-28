import React from 'react';
import type { PlayerRef } from './player-methods';
export declare type ErrorFallback = (info: {
    error: Error;
}) => React.ReactNode;
export declare type RenderLoading = (canvas: {
    height: number;
    width: number;
}) => React.ReactChild;
declare const _default: (props: {
    controls: boolean;
    loop: boolean;
    autoPlay: boolean;
    allowFullscreen: boolean;
    inputProps: unknown;
    showVolumeControls: boolean;
    mediaMuted: boolean;
    style?: React.CSSProperties | undefined;
    clickToPlay: boolean;
    doubleClickToFullscreen: boolean;
    spaceKeyToPlayOrPause: boolean;
    setMediaVolume: (v: number) => void;
    setMediaMuted: (v: boolean) => void;
    mediaVolume: number;
    errorFallback: ErrorFallback;
    playbackRate: number;
    renderLoading?: RenderLoading | undefined;
    className: string | undefined;
    moveToBeginningWhenEnded: boolean;
} & React.RefAttributes<PlayerRef | null>) => React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export default _default;

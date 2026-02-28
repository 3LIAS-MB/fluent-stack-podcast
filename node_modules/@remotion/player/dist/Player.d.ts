import type { ComponentType, MutableRefObject } from 'react';
import React from 'react';
import type { CompProps } from 'remotion';
import type { PlayerRef } from './player-methods';
import type { RenderLoading } from './PlayerUI';
declare type PropsIfHasProps<Props> = {} extends Props ? {
    inputProps?: Props;
} : {
    inputProps: Props;
};
export declare type ErrorFallback = (info: {
    error: Error;
}) => React.ReactNode;
export declare type PlayerProps<T> = {
    durationInFrames: number;
    compositionWidth: number;
    compositionHeight: number;
    fps: number;
    showVolumeControls?: boolean;
    controls?: boolean;
    errorFallback?: ErrorFallback;
    style?: React.CSSProperties;
    loop?: boolean;
    autoPlay?: boolean;
    allowFullscreen?: boolean;
    clickToPlay?: boolean;
    doubleClickToFullscreen?: boolean;
    spaceKeyToPlayOrPause?: boolean;
    numberOfSharedAudioTags?: number;
    playbackRate?: number;
    renderLoading?: RenderLoading;
    moveToBeginningWhenEnded?: boolean;
    className?: string;
} & PropsIfHasProps<T> & CompProps<T>;
export declare const componentOrNullIfLazy: <T>(props: CompProps<T>) => ComponentType<T> | null;
export declare const PlayerFn: <T>({ durationInFrames, compositionHeight, compositionWidth, fps, inputProps, style, controls, loop, autoPlay, showVolumeControls, allowFullscreen, clickToPlay, doubleClickToFullscreen, spaceKeyToPlayOrPause, moveToBeginningWhenEnded, numberOfSharedAudioTags, errorFallback, playbackRate, renderLoading, className, ...componentProps }: PlayerProps<T>, ref: MutableRefObject<PlayerRef>) => JSX.Element;
declare module 'react' {
    function forwardRef<T, P = {}>(render: (props: P, ref: React.MutableRefObject<T>) => React.ReactElement | null): (props: P & React.RefAttributes<T>) => React.ReactElement | null;
}
export declare const Player: <T>(props: PlayerProps<T> & React.RefAttributes<PlayerRef>) => React.ReactElement | null;
export {};

import type { MouseEventHandler } from 'react';
import React from 'react';
import type { usePlayer } from './use-player';
declare global {
    interface Document {
        webkitFullscreenEnabled?: boolean;
        webkitFullscreenElement?: Element;
        webkitExitFullscreen?: Document['exitFullscreen'];
    }
    interface HTMLDivElement {
        webkitRequestFullScreen: HTMLDivElement['requestFullscreen'];
    }
}
export declare const Controls: React.FC<{
    fps: number;
    durationInFrames: number;
    hovered: boolean;
    showVolumeControls: boolean;
    player: ReturnType<typeof usePlayer>;
    onFullscreenButtonClick: MouseEventHandler<HTMLButtonElement>;
    isFullscreen: boolean;
    allowFullscreen: boolean;
    onExitFullscreenButtonClick: MouseEventHandler<HTMLButtonElement>;
    spaceKeyToPlayOrPause: boolean;
}>;

import React from 'react';
export declare type LoopProps = {
    durationInFrames: number;
    times?: number;
    layout?: 'absolute-fill' | 'none';
    name?: string;
    children: React.ReactNode;
};
export declare const Loop: React.FC<LoopProps>;

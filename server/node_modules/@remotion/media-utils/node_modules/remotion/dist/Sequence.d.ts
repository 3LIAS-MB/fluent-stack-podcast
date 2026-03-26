import React from 'react';
export declare type SequenceContextType = {
    cumulatedFrom: number;
    relativeFrom: number;
    parentFrom: number;
    durationInFrames: number;
    id: string;
};
export declare const SequenceContext: React.Context<SequenceContextType | null>;
declare type LayoutAndStyle = {
    layout: 'none';
} | {
    layout?: 'absolute-fill';
    style?: React.CSSProperties;
};
export declare type SequenceProps = {
    children: React.ReactNode;
    from: number;
    durationInFrames?: number;
    name?: string;
    showInTimeline?: boolean;
    showLoopTimesInTimeline?: number;
} & LayoutAndStyle;
export declare const Sequence: React.FC<SequenceProps>;
export {};

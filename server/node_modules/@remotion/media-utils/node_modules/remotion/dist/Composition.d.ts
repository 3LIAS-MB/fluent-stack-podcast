import type { ComponentType } from 'react';
import React from 'react';
declare type LooseComponentType<T> = ComponentType<T> | ((props: T) => React.ReactNode);
export declare type CompProps<T> = {
    lazyComponent: () => Promise<{
        default: LooseComponentType<T>;
    }>;
} | {
    component: LooseComponentType<T>;
};
export declare type StillProps<T> = {
    width: number;
    height: number;
    id: string;
    defaultProps?: T;
} & CompProps<T>;
declare type CompositionProps<T> = StillProps<T> & {
    fps: number;
    durationInFrames: number;
};
export declare const Composition: <T>({ width, height, fps, durationInFrames, id, defaultProps, ...compProps }: CompositionProps<T>) => React.ReactPortal | null;
export {};

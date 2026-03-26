import type { SpringConfig } from './spring-utils';
export declare function measureSpring({ fps, config, threshold, from, to, }: {
    fps: number;
    config?: Partial<SpringConfig>;
    threshold?: number;
    from?: number;
    to?: number;
}): number;

import type { FC, PropsWithChildren } from 'react';
import type { SequenceProps } from '../Sequence';
declare type SeriesSequenceProps = PropsWithChildren<{
    durationInFrames: number;
    offset?: number;
} & Pick<SequenceProps, 'layout' | 'name'>>;
declare const SeriesSequence: ({ children }: SeriesSequenceProps) => JSX.Element;
declare const Series: FC<{
    children: React.ReactNode;
}> & {
    Sequence: typeof SeriesSequence;
};
export { Series };

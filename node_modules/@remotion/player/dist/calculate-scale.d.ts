import type { PreviewSize } from './utils/preview-size';
import type { Size } from './utils/use-element-size';
export declare const calculateScale: ({ previewSize, compositionWidth, compositionHeight, canvasSize, }: {
    previewSize: PreviewSize;
    compositionWidth: number;
    compositionHeight: number;
    canvasSize: Size;
}) => {
    centerX: number;
    centerY: number;
    xCorrection: number;
    yCorrection: number;
    scale: number;
};

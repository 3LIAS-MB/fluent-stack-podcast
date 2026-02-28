"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScale = void 0;
const calculateScale = ({ previewSize, compositionWidth, compositionHeight, canvasSize, }) => {
    const heightRatio = canvasSize.height / compositionHeight;
    const widthRatio = canvasSize.width / compositionWidth;
    const ratio = Math.min(heightRatio, widthRatio);
    const scale = previewSize === 'auto' ? ratio : Number(previewSize);
    const correction = 0 - (1 - scale) / 2;
    const xCorrection = correction * compositionWidth;
    const yCorrection = correction * compositionHeight;
    const width = compositionWidth * scale;
    const height = compositionHeight * scale;
    const centerX = canvasSize.width / 2 - width / 2;
    const centerY = canvasSize.height / 2 - height / 2;
    return {
        centerX,
        centerY,
        xCorrection,
        yCorrection,
        scale,
    };
};
exports.calculateScale = calculateScale;

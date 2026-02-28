"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePlayerSize = void 0;
const calculatePlayerSize = ({ currentSize, width, height, compositionWidth, compositionHeight, }) => {
    const aspectRatio = compositionWidth / compositionHeight;
    if (!currentSize) {
        return {
            width: compositionWidth,
            height: compositionHeight,
        };
    }
    // If has width specified, but no height, specify a default height that satisfies the aspect ratio.
    if (width !== undefined && height === undefined) {
        return {
            height: currentSize.width / aspectRatio,
        };
    }
    // Opposite: If has height specified, evaluate the height and specify a default width.
    if (height !== undefined && width === undefined) {
        return {
            width: currentSize.height * aspectRatio,
        };
    }
    return {
        width: compositionWidth,
        height: compositionHeight,
    };
};
exports.calculatePlayerSize = calculatePlayerSize;

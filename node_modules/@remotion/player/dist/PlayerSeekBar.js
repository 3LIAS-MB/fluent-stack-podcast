"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSeekBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const use_hover_state_1 = require("./use-hover-state");
const use_player_1 = require("./use-player");
const use_element_size_1 = require("./utils/use-element-size");
const getFrameFromX = (clientX, durationInFrames, width) => {
    var _a;
    const pos = clientX;
    const frame = Math.round((0, remotion_1.interpolate)(pos, [0, width], [0, (_a = durationInFrames - 1) !== null && _a !== void 0 ? _a : 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    }));
    return frame;
};
const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VERTICAL_PADDING = 4;
const containerStyle = {
    userSelect: 'none',
    paddingTop: VERTICAL_PADDING,
    paddingBottom: VERTICAL_PADDING,
    boxSizing: 'border-box',
    cursor: 'pointer',
    position: 'relative',
    touchAction: 'none',
};
const barBackground = {
    height: BAR_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: '100%',
    borderRadius: BAR_HEIGHT / 2,
};
const PlayerSeekBar = ({ durationInFrames }) => {
    const containerRef = (0, react_1.useRef)(null);
    const barHovered = (0, use_hover_state_1.useHoverState)(containerRef);
    const size = (0, use_element_size_1.useElementSize)(containerRef, {
        triggerOnWindowResize: true,
        shouldApplyCssTransforms: true,
    });
    const { seek, play, pause, playing } = (0, use_player_1.usePlayer)();
    const frame = remotion_1.Internals.Timeline.useTimelinePosition();
    const [dragging, setDragging] = (0, react_1.useState)({
        dragging: false,
    });
    const onPointerDown = (0, react_1.useCallback)((e) => {
        if (!size) {
            throw new Error('Player has no size');
        }
        const _frame = getFrameFromX(e.clientX - size.left, durationInFrames, size.width);
        pause();
        seek(_frame);
        setDragging({
            dragging: true,
            wasPlaying: playing,
        });
    }, [size, durationInFrames, pause, seek, playing]);
    const onPointerMove = (0, react_1.useCallback)((e) => {
        var _a;
        if (!size) {
            throw new Error('Player has no size');
        }
        if (!dragging.dragging) {
            return;
        }
        const _frame = getFrameFromX(e.clientX - ((_a = size === null || size === void 0 ? void 0 : size.left) !== null && _a !== void 0 ? _a : 0), durationInFrames, size.width);
        seek(_frame);
    }, [dragging.dragging, durationInFrames, seek, size]);
    const onPointerUp = (0, react_1.useCallback)(() => {
        setDragging({
            dragging: false,
        });
        if (!dragging.dragging) {
            return;
        }
        if (dragging.wasPlaying) {
            play();
        }
        else {
            pause();
        }
    }, [dragging, pause, play]);
    (0, react_1.useEffect)(() => {
        if (!dragging.dragging) {
            return;
        }
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [dragging.dragging, onPointerMove, onPointerUp]);
    const knobStyle = (0, react_1.useMemo)(() => {
        var _a;
        return {
            height: KNOB_SIZE,
            width: KNOB_SIZE,
            borderRadius: KNOB_SIZE / 2,
            position: 'absolute',
            top: VERTICAL_PADDING - KNOB_SIZE / 2 + 5 / 2,
            backgroundColor: 'white',
            left: Math.max(0, (frame / Math.max(1, durationInFrames - 1)) * ((_a = size === null || size === void 0 ? void 0 : size.width) !== null && _a !== void 0 ? _a : 0) -
                KNOB_SIZE / 2),
            boxShadow: '0 0 2px black',
            opacity: Number(barHovered),
        };
    }, [barHovered, durationInFrames, frame, size]);
    const fillStyle = (0, react_1.useMemo)(() => {
        return {
            height: BAR_HEIGHT,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            width: (frame / (durationInFrames - 1)) * 100 + '%',
            borderRadius: BAR_HEIGHT / 2,
        };
    }, [durationInFrames, frame]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: containerRef, onPointerDown: onPointerDown, style: containerStyle, children: [(0, jsx_runtime_1.jsx)("div", { style: barBackground, children: (0, jsx_runtime_1.jsx)("div", { style: fillStyle }) }), (0, jsx_runtime_1.jsx)("div", { style: knobStyle })] }));
};
exports.PlayerSeekBar = PlayerSeekBar;

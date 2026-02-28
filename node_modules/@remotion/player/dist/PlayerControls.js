"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const format_time_1 = require("./format-time");
const icons_1 = require("./icons");
const MediaVolumeSlider_1 = require("./MediaVolumeSlider");
const PlayerSeekBar_1 = require("./PlayerSeekBar");
const containerStyle = {
    boxSizing: 'border-box',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.4))',
    display: 'flex',
    paddingRight: 12,
    paddingLeft: 12,
    flexDirection: 'column',
    transition: 'opacity 0.3s',
};
const buttonStyle = {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'inline',
    marginBottom: 0,
    marginTop: 0,
    height: 25,
};
const controlsRow = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
};
const leftPartStyle = {
    display: 'flex',
    flexDirection: 'row',
    userSelect: 'none',
    alignItems: 'center',
};
const xSpacer = {
    width: 10,
};
const ySpacer = {
    height: 8,
};
const flex1 = {
    flex: 1,
};
const fullscreen = {};
const timeLabel = {
    color: 'white',
    fontFamily: 'sans-serif',
    fontSize: 14,
};
const Controls = ({ durationInFrames, hovered, isFullscreen, fps, player, showVolumeControls, onFullscreenButtonClick, allowFullscreen, onExitFullscreenButtonClick, spaceKeyToPlayOrPause, }) => {
    const playButtonRef = (0, react_1.useRef)(null);
    const frame = remotion_1.Internals.Timeline.useTimelinePosition();
    const [supportsFullscreen, setSupportsFullscreen] = (0, react_1.useState)(false);
    const containerCss = (0, react_1.useMemo)(() => {
        // Hide if playing and mouse outside
        const shouldShow = hovered || !player.playing;
        return {
            ...containerStyle,
            opacity: Number(shouldShow),
        };
    }, [hovered, player.playing]);
    (0, react_1.useEffect)(() => {
        if (playButtonRef.current && spaceKeyToPlayOrPause) {
            // This switches focus to play button when player.playing flag changes
            playButtonRef.current.focus({
                preventScroll: true,
            });
        }
    }, [player.playing, spaceKeyToPlayOrPause]);
    (0, react_1.useEffect)(() => {
        var _a;
        // Must be handled client-side to avoid SSR hydration mismatch
        setSupportsFullscreen((_a = (typeof document !== 'undefined' &&
            (document.fullscreenEnabled || document.webkitFullscreenEnabled))) !== null && _a !== void 0 ? _a : false);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { style: containerCss, children: [(0, jsx_runtime_1.jsxs)("div", { style: controlsRow, children: [(0, jsx_runtime_1.jsxs)("div", { style: leftPartStyle, children: [(0, jsx_runtime_1.jsx)("button", { ref: playButtonRef, type: "button", style: buttonStyle, onClick: player.playing ? player.pause : player.play, "aria-label": player.playing ? 'Pause video' : 'Play video', title: player.playing ? 'Pause video' : 'Play video', children: player.playing ? (0, jsx_runtime_1.jsx)(icons_1.PauseIcon, {}) : (0, jsx_runtime_1.jsx)(icons_1.PlayIcon, {}) }), showVolumeControls ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: xSpacer }), (0, jsx_runtime_1.jsx)(MediaVolumeSlider_1.MediaVolumeSlider, {})] })) : null, (0, jsx_runtime_1.jsx)("div", { style: xSpacer }), (0, jsx_runtime_1.jsxs)("div", { style: timeLabel, children: [(0, format_time_1.formatTime)(frame / fps), " / ", (0, format_time_1.formatTime)(durationInFrames / fps)] }), (0, jsx_runtime_1.jsx)("div", { style: xSpacer })] }), (0, jsx_runtime_1.jsx)("div", { style: flex1 }), (0, jsx_runtime_1.jsx)("div", { style: fullscreen, children: supportsFullscreen && allowFullscreen ? ((0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": isFullscreen ? 'Exit fullscreen' : 'Enter Fullscreen', title: isFullscreen ? 'Exit fullscreen' : 'Enter Fullscreen', style: buttonStyle, onClick: isFullscreen
                                ? onExitFullscreenButtonClick
                                : onFullscreenButtonClick, children: (0, jsx_runtime_1.jsx)(icons_1.FullscreenIcon, { minimized: !isFullscreen }) })) : null })] }), (0, jsx_runtime_1.jsx)("div", { style: ySpacer }), (0, jsx_runtime_1.jsx)(PlayerSeekBar_1.PlayerSeekBar, { durationInFrames: durationInFrames })] }));
};
exports.Controls = Controls;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaVolumeSlider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const icons_1 = require("./icons");
const player_css_classname_1 = require("./player-css-classname");
const use_hover_state_1 = require("./use-hover-state");
const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VOLUME_SLIDER_WIDTH = 100;
const scope = `.${player_css_classname_1.VOLUME_SLIDER_INPUT_CSS_CLASSNAME}`;
const sliderStyle = `
	${scope} {
		-webkit-appearance: none;
		background-color: rgba(255, 255, 255, 0.5);	
		border-radius: ${BAR_HEIGHT / 2}px;
		cursor: pointer;
		height: ${BAR_HEIGHT}px;
		margin-left: 5px;
		width: ${VOLUME_SLIDER_WIDTH}px;
	}

	${scope}::-webkit-slider-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}

	${scope}::-moz-range-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${KNOB_SIZE / 2}px;
		box-shadow: 0 0 2px black;
		height: ${KNOB_SIZE}px;
		width: ${KNOB_SIZE}px;
	}
`;
remotion_1.Internals.CSSUtils.injectCSS(sliderStyle);
const parentDivStyle = {
    display: 'inline-flex',
    background: 'none',
    border: 'none',
    padding: '6px',
    justifyContent: 'center',
    alignItems: 'center',
    touchAction: 'none',
};
const volumeContainer = {
    display: 'inline',
    width: icons_1.ICON_SIZE,
    height: icons_1.ICON_SIZE,
    cursor: 'pointer',
    appearance: 'none',
    background: 'none',
    border: 'none',
    padding: 0,
};
const MediaVolumeSlider = () => {
    const [mediaMuted, setMediaMuted] = remotion_1.Internals.useMediaMutedState();
    const [mediaVolume, setMediaVolume] = remotion_1.Internals.useMediaVolumeState();
    const [focused, setFocused] = (0, react_1.useState)(false);
    const parentDivRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const hover = (0, use_hover_state_1.useHoverState)(parentDivRef);
    const isMutedOrZero = mediaMuted || mediaVolume === 0;
    const onVolumeChange = (e) => {
        setMediaVolume(parseFloat(e.target.value));
    };
    const onBlur = () => {
        setTimeout(() => {
            // We need a small delay to check which element was focused next,
            // and if it wasn't the volume slider, we hide it
            if (document.activeElement !== inputRef.current) {
                setFocused(false);
            }
        }, 10);
    };
    const onClick = (0, react_1.useCallback)(() => {
        if (mediaVolume === 0) {
            setMediaVolume(1);
            setMediaMuted(false);
            return;
        }
        setMediaMuted((mute) => !mute);
    }, [mediaVolume, setMediaMuted, setMediaVolume]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: parentDivRef, style: parentDivStyle, children: [(0, jsx_runtime_1.jsx)("button", { "aria-label": isMutedOrZero ? 'Unmute sound' : 'Mute sound', title: isMutedOrZero ? 'Unmute sound' : 'Mute sound', onClick: onClick, onBlur: onBlur, onFocus: () => setFocused(true), style: volumeContainer, type: "button", children: isMutedOrZero ? (0, jsx_runtime_1.jsx)(icons_1.VolumeOffIcon, {}) : (0, jsx_runtime_1.jsx)(icons_1.VolumeOnIcon, {}) }), (focused || hover) && !mediaMuted ? ((0, jsx_runtime_1.jsx)("input", { ref: inputRef, "aria-label": "Change volume", className: player_css_classname_1.VOLUME_SLIDER_INPUT_CSS_CLASSNAME, max: 1, min: 0, onBlur: () => setFocused(false), onChange: onVolumeChange, step: 0.01, type: "range", value: mediaVolume })) : null] }));
};
exports.MediaVolumeSlider = MediaVolumeSlider;

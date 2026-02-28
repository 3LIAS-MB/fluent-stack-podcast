"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffthreadVideo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const get_environment_1 = require("../get-environment");
const Sequence_1 = require("../Sequence");
const validate_media_props_1 = require("../validate-media-props");
const validate_start_from_props_1 = require("../validate-start-from-props");
const validate_offthreadvideo_image_format_1 = require("../validation/validate-offthreadvideo-image-format");
const OffthreadVideoForRendering_1 = require("./OffthreadVideoForRendering");
const VideoForDevelopment_1 = require("./VideoForDevelopment");
const OffthreadVideo = (props) => {
    const { startFrom, endAt, ...otherProps } = props;
    if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
        (0, validate_start_from_props_1.validateStartFromProps)(startFrom, endAt);
        const startFromFrameNo = startFrom !== null && startFrom !== void 0 ? startFrom : 0;
        const endAtFrameNo = endAt !== null && endAt !== void 0 ? endAt : Infinity;
        return ((0, jsx_runtime_1.jsx)(Sequence_1.Sequence, { layout: "none", from: 0 - startFromFrameNo, showInTimeline: false, durationInFrames: endAtFrameNo, children: (0, jsx_runtime_1.jsx)(exports.OffthreadVideo, { ...otherProps }) }));
    }
    (0, validate_media_props_1.validateMediaProps)(props, 'Video');
    (0, validate_offthreadvideo_image_format_1.validateOffthreadVideoImageFormat)(props.imageFormat);
    if ((0, get_environment_1.getRemotionEnvironment)() === 'rendering') {
        return (0, jsx_runtime_1.jsx)(OffthreadVideoForRendering_1.OffthreadVideoForRendering, { ...otherProps });
    }
    return (0, jsx_runtime_1.jsx)(VideoForDevelopment_1.VideoForDevelopment, { onlyWarnForMediaSeekingError: true, ...otherProps });
};
exports.OffthreadVideo = OffthreadVideo;

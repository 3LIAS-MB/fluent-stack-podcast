"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Img = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const delay_render_1 = require("./delay-render");
const ImgRefForwarding = ({ onError, ...props }, ref) => {
    const imageRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, () => {
        return imageRef.current;
    });
    const didGetError = (0, react_1.useCallback)((e) => {
        var _a;
        if (onError) {
            onError(e);
        }
        else {
            console.error('Error loading image with src:', (_a = imageRef.current) === null || _a === void 0 ? void 0 : _a.src, e, 'Handle the event using the onError() prop to make this message disappear.');
        }
    }, [onError]);
    // If image source switches, make new handle
    (0, react_1.useLayoutEffect)(() => {
        if (process.env.NODE_ENV === 'test') {
            return;
        }
        const newHandle = (0, delay_render_1.delayRender)('Loading <Img> with src=' + props.src);
        const { current } = imageRef;
        const didLoad = () => {
            (0, delay_render_1.continueRender)(newHandle);
        };
        if (current === null || current === void 0 ? void 0 : current.complete) {
            (0, delay_render_1.continueRender)(newHandle);
        }
        else {
            current === null || current === void 0 ? void 0 : current.addEventListener('load', didLoad, { once: true });
        }
        // If tag gets unmounted, clear pending handles because image is not going to load
        return () => {
            current === null || current === void 0 ? void 0 : current.removeEventListener('load', didLoad);
            (0, delay_render_1.continueRender)(newHandle);
        };
    }, [props.src]);
    return (0, jsx_runtime_1.jsx)("img", { ...props, ref: imageRef, onError: didGetError });
};
exports.Img = (0, react_1.forwardRef)(ImgRefForwarding);

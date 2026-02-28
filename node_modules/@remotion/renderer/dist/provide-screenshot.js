"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provideScreenshot = void 0;
const screenshot_dom_element_1 = require("./screenshot-dom-element");
const provideScreenshot = ({ page, imageFormat, options, quality, }) => {
    return (0, screenshot_dom_element_1.screenshotDOMElement)({
        page,
        opts: {
            path: options.output,
        },
        imageFormat,
        quality,
    });
};
exports.provideScreenshot = provideScreenshot;

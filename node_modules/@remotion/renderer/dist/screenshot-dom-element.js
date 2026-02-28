"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshotDOMElement = void 0;
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const puppeteer_screenshot_1 = require("./puppeteer-screenshot");
const screenshotDOMElement = async ({ page, imageFormat, quality, opts, }) => {
    const { path } = opts;
    if (imageFormat === 'png') {
        await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
            pageFunction: () => {
                document.body.style.background = 'transparent';
            },
            args: [],
            frame: null,
            page,
        });
    }
    else {
        await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
            pageFunction: () => {
                document.body.style.background = 'black';
            },
            args: [],
            frame: null,
            page,
        });
    }
    if (imageFormat === 'none') {
        throw new TypeError('Tried to make a screenshot with format "none"');
    }
    return (0, puppeteer_screenshot_1.screenshot)(page, {
        omitBackground: imageFormat === 'png',
        path: path !== null && path !== void 0 ? path : undefined,
        type: imageFormat,
        quality,
    });
};
exports.screenshotDOMElement = screenshotDOMElement;

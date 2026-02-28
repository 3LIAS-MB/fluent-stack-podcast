"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seekToFrame = void 0;
const puppeteer_evaluate_1 = require("./puppeteer-evaluate");
const seekToFrame = async ({ frame, page, }) => {
    await page.waitForFunction(page.browser, 'window.ready === true');
    await (0, puppeteer_evaluate_1.puppeteerEvaluateWithCatch)({
        pageFunction: (f) => {
            window.remotion_setFrame(f);
        },
        args: [frame],
        frame,
        page,
    });
    await page.waitForFunction(page.browser, 'window.ready === true');
    await page.evaluateHandle('document.fonts.ready');
};
exports.seekToFrame = seekToFrame;

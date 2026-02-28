/// <reference types="node" />
import type { Page } from './browser/BrowserPage';
import type { ScreenshotOptions } from './browser/ScreenshotOptions';
export declare const screenshot: (page: Page, options: ScreenshotOptions) => Promise<Buffer | string | void>;

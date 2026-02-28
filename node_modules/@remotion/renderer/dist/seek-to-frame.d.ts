import type { Page } from './browser/BrowserPage';
export declare const seekToFrame: ({ frame, page, }: {
    frame: number;
    page: Page;
}) => Promise<void>;

import type { openBrowser } from './open-browser';
declare type Await<T> = T extends PromiseLike<infer U> ? U : T;
declare type Browser = Await<ReturnType<typeof openBrowser>>;
export declare const cycleBrowserTabs: (puppeteerInstance: Browser, concurrency: number) => {
    stopCycling: () => void;
};
export {};

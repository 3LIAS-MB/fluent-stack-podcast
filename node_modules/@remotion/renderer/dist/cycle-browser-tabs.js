"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cycleBrowserTabs = void 0;
const cycleBrowserTabs = (puppeteerInstance, concurrency) => {
    if (concurrency <= 1) {
        return {
            stopCycling: () => undefined,
        };
    }
    let interval = null;
    let i = 0;
    let stopped = false;
    const set = () => {
        interval = setTimeout(() => {
            puppeteerInstance
                .pages()
                .then((pages) => {
                var _a;
                if (pages.length === 0) {
                    return;
                }
                const currentPage = pages[i % pages.length];
                i++;
                if (!((_a = currentPage === null || currentPage === void 0 ? void 0 : currentPage.isClosed) === null || _a === void 0 ? void 0 : _a.call(currentPage)) &&
                    !stopped &&
                    (currentPage === null || currentPage === void 0 ? void 0 : currentPage.url()) !== 'about:blank') {
                    return currentPage.bringToFront();
                }
            })
                .then(() => {
                set();
            })
                .catch((err) => console.log(err));
        }, 200);
    };
    set();
    return {
        stopCycling: () => {
            if (!interval) {
                return;
            }
            stopped = true;
            return clearInterval(interval);
        },
    };
};
exports.cycleBrowserTabs = cycleBrowserTabs;

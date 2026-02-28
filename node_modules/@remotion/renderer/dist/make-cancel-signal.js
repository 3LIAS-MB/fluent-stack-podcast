"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCancelSignal = void 0;
const makeCancelSignal = () => {
    const callbacks = [];
    let cancelled = false;
    return {
        cancelSignal: (callback) => {
            callbacks.push(callback);
            if (cancelled) {
                callback();
            }
        },
        cancel: () => {
            if (cancelled) {
                return;
            }
            callbacks.forEach((cb) => {
                cb();
            });
            cancelled = true;
        },
    };
};
exports.makeCancelSignal = makeCancelSignal;

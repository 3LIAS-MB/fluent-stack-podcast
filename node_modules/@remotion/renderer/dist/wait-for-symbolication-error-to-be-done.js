"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForSymbolicationToBeDone = exports.unlockErrorSymbolicationLock = exports.registerErrorSymbolicationLock = void 0;
let locks = [];
const waiters = [];
const registerErrorSymbolicationLock = () => {
    const id = Math.random();
    locks.push(id);
    return id;
};
exports.registerErrorSymbolicationLock = registerErrorSymbolicationLock;
const unlockErrorSymbolicationLock = (id) => {
    locks = locks.filter((l) => l !== id);
    resolveWaiters();
};
exports.unlockErrorSymbolicationLock = unlockErrorSymbolicationLock;
const resolveWaiters = () => {
    if (locks.length === 0) {
        waiters.forEach((w) => w());
    }
};
const waitForSymbolicationToBeDone = () => {
    const success = new Promise((resolve) => {
        waiters.push(() => {
            resolve();
        });
    });
    const timeout = new Promise((resolve) => {
        setTimeout(() => resolve(), 5000);
    });
    resolveWaiters();
    return Promise.all([success, timeout]);
};
exports.waitForSymbolicationToBeDone = waitForSymbolicationToBeDone;

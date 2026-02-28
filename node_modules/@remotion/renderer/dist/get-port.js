"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDesiredPort = void 0;
const net_1 = __importDefault(require("net"));
const p_limit_1 = require("./p-limit");
const getAvailablePort = (portToTry) => new Promise((resolve) => {
    let status = 'unavailable';
    const host = '127.0.0.1';
    const socket = new net_1.default.Socket();
    socket.on('connect', () => {
        status = 'unavailable';
        socket.destroy();
    });
    socket.setTimeout(3000);
    socket.on('timeout', () => {
        status = 'unavailable';
        socket.destroy();
        resolve(status);
    });
    socket.on('error', () => {
        status = 'available';
    });
    socket.on('close', () => resolve(status));
    socket.connect(portToTry, host);
});
const getPort = async (from, to) => {
    const ports = makeRange(from, to);
    for (const port of ports) {
        if ((await getAvailablePort(port)) === 'available') {
            return port;
        }
    }
    throw new Error('No available ports found');
};
const getDesiredPortUnlimited = async (desiredPort, from, to) => {
    if (typeof desiredPort !== 'undefined' &&
        (await getAvailablePort(desiredPort)) === 'available') {
        return desiredPort;
    }
    const actualPort = await getPort(from, to);
    // If did specify a port but did not get that one, fail hard.
    if (desiredPort && desiredPort !== actualPort) {
        throw new Error(`You specified port ${desiredPort} to be used for the HTTP server, but it is not available. Choose a different port or remove the setting to let Remotion automatically select a free port.`);
    }
    return actualPort;
};
const limit = (0, p_limit_1.pLimit)(1);
const getDesiredPort = (desiredPort, from, to) => {
    return limit(() => getDesiredPortUnlimited(desiredPort, from, to));
};
exports.getDesiredPort = getDesiredPort;
const makeRange = (from, to) => {
    if (!Number.isInteger(from) || !Number.isInteger(to)) {
        throw new TypeError('`from` and `to` must be integer numbers');
    }
    if (from < 1024 || from > 65535) {
        throw new RangeError('`from` must be between 1024 and 65535');
    }
    if (to < 1024 || to > 65536) {
        throw new RangeError('`to` must be between 1024 and 65536');
    }
    if (to < from) {
        throw new RangeError('`to` must be greater than or equal to `from`');
    }
    return new Array(to - from + 1).fill(true).map((_, i) => {
        return i + from;
    });
};

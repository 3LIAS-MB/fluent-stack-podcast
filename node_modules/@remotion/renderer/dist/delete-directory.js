"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDirectory = void 0;
const execa_1 = __importDefault(require("execa"));
const fs_1 = __importDefault(require("fs"));
const is_serve_url_1 = require("./is-serve-url");
const deleteDirectory = async (directory) => {
    var _a;
    if ((0, is_serve_url_1.isServeUrl)(directory)) {
        return;
    }
    if (process.platform === 'win32') {
        // We use del before to remove all files inside the directories otherwise
        // rmdir will throw an error.
        await (0, execa_1.default)('cmd', ['/c', 'del', '/f', '/s', '/q', directory]);
        try {
            await (0, execa_1.default)('cmd', ['/c', 'rmdir', '/s', '/q', directory]);
        }
        catch (err) {
            // Is not a directory
        }
    }
    else {
        await ((_a = fs_1.default.promises.rm) !== null && _a !== void 0 ? _a : fs_1.default.promises.rmdir)(directory, {
            recursive: true,
        });
    }
};
exports.deleteDirectory = deleteDirectory;

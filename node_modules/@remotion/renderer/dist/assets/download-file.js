"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = void 0;
const fs_1 = require("fs");
const ensure_output_directory_1 = require("../ensure-output-directory");
const read_file_1 = require("./read-file");
const downloadFile = ({ onProgress, url, to: toFn, }) => {
    return new Promise((resolve, reject) => {
        (0, read_file_1.readFile)(url)
            .then((res) => {
            var _a;
            const contentDisposition = (_a = res.headers['content-disposition']) !== null && _a !== void 0 ? _a : null;
            const to = toFn(contentDisposition);
            (0, ensure_output_directory_1.ensureOutputDirectory)(to);
            const sizeHeader = res.headers['content-length'];
            const totalSize = typeof sizeHeader === 'undefined' ? null : Number(sizeHeader);
            const writeStream = (0, fs_1.createWriteStream)(to);
            let downloaded = 0;
            // Listen to 'close' event instead of more
            // concise method to avoid this problem
            // https://github.com/remotion-dev/remotion/issues/384#issuecomment-844398183
            writeStream.on('close', () => {
                onProgress === null || onProgress === void 0 ? void 0 : onProgress({
                    downloaded,
                    percent: 1,
                    totalSize: downloaded,
                });
                return resolve({ sizeInBytes: downloaded, to });
            });
            writeStream.on('error', (err) => reject(err));
            res.pipe(writeStream).on('error', (err) => reject(err));
            res.on('data', (d) => {
                downloaded += d.length;
                onProgress === null || onProgress === void 0 ? void 0 : onProgress({
                    downloaded,
                    percent: totalSize === null ? null : downloaded / totalSize,
                    totalSize,
                });
            });
        })
            .catch((err) => {
            reject(err);
        });
    });
};
exports.downloadFile = downloadFile;

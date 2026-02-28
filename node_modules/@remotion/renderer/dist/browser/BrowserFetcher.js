"use strict";
/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _BrowserFetcher_instances, _BrowserFetcher_product, _BrowserFetcher_downloadsFolder, _BrowserFetcher_downloadHost, _BrowserFetcher_platform, _BrowserFetcher_getFolderPath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserFetcher = void 0;
const childProcess = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const extract_zip_1 = __importDefault(require("extract-zip"));
const URL = __importStar(require("url"));
const util_1 = require("util");
const assert_1 = require("./assert");
const delete_directory_1 = require("../delete-directory");
const get_download_destination_1 = require("./get-download-destination");
const { PUPPETEER_EXPERIMENTAL_CHROMIUM_MAC_ARM } = process.env;
const downloadURLs = {
    chrome: {
        linux: '%s/chromium-browser-snapshots/Linux_x64/%d/%s.zip',
        mac: '%s/chromium-browser-snapshots/Mac/%d/%s.zip',
        mac_arm: '%s/chromium-browser-snapshots/Mac_Arm/%d/%s.zip',
        win32: '%s/chromium-browser-snapshots/Win/%d/%s.zip',
        win64: '%s/chromium-browser-snapshots/Win_x64/%d/%s.zip',
    },
    firefox: {
        linux: '%s/firefox-%s.en-US.%s-x86_64.tar.bz2',
        mac: '%s/firefox-%s.en-US.%s.dmg',
        win32: '%s/firefox-%s.en-US.%s.zip',
        win64: '%s/firefox-%s.en-US.%s.zip',
    },
};
const browserConfig = {
    chrome: {
        host: 'https://storage.googleapis.com',
        destination: '.chromium',
    },
    firefox: {
        host: 'https://archive.mozilla.org/pub/firefox/nightly/latest-mozilla-central',
        destination: '.firefox',
    },
};
function archiveName(product, platform, revision) {
    switch (product) {
        case 'chrome':
            switch (platform) {
                case 'linux':
                    return 'chrome-linux';
                case 'mac_arm':
                case 'mac':
                    return 'chrome-mac';
                case 'win32':
                case 'win64':
                    // Windows archive name changed at r591479.
                    return parseInt(revision, 10) > 591479
                        ? 'chrome-win'
                        : 'chrome-win32';
                default:
                    throw new Error('unknown browser');
            }
        case 'firefox':
            return platform;
        default:
            throw new Error('unknown browser');
    }
}
function _downloadURL(product, platform, host, revision) {
    const url = util.format(downloadURLs[product][platform], host, revision, archiveName(product, platform, revision));
    return url;
}
function handleArm64() {
    let exists = fs.existsSync('/usr/bin/chromium-browser');
    if (exists) {
        return;
    }
    exists = fs.existsSync('/usr/bin/chromium');
    if (exists) {
        return;
    }
    console.error('The chromium binary is not available for arm64.' +
        '\nIf you are on Ubuntu, you can install with: ' +
        '\n\n sudo apt install chromium\n' +
        '\n\n sudo apt install chromium-browser\n');
    throw new Error();
}
const readdirAsync = (0, util_1.promisify)(fs.readdir.bind(fs));
const mkdirAsync = (0, util_1.promisify)(fs.mkdir.bind(fs));
const unlinkAsync = (0, util_1.promisify)(fs.unlink.bind(fs));
const chmodAsync = (0, util_1.promisify)(fs.chmod.bind(fs));
function existsAsync(filePath) {
    return new Promise((resolve) => {
        fs.access(filePath, (err) => {
            return resolve(!err);
        });
    });
}
class BrowserFetcher {
    constructor(options) {
        _BrowserFetcher_instances.add(this);
        _BrowserFetcher_product.set(this, void 0);
        _BrowserFetcher_downloadsFolder.set(this, void 0);
        _BrowserFetcher_downloadHost.set(this, void 0);
        _BrowserFetcher_platform.set(this, void 0);
        __classPrivateFieldSet(this, _BrowserFetcher_product, options.product.toLowerCase(), "f");
        (0, assert_1.assert)(__classPrivateFieldGet(this, _BrowserFetcher_product, "f") === 'chrome' || __classPrivateFieldGet(this, _BrowserFetcher_product, "f") === 'firefox', `Unknown product: "${options.product}"`);
        __classPrivateFieldSet(this, _BrowserFetcher_downloadsFolder, options.path ||
            path.join((0, get_download_destination_1.getDownloadsCacheDir)(), browserConfig[__classPrivateFieldGet(this, _BrowserFetcher_product, "f")].destination), "f");
        __classPrivateFieldSet(this, _BrowserFetcher_downloadHost, browserConfig[__classPrivateFieldGet(this, _BrowserFetcher_product, "f")].host, "f");
        if (options.platform) {
            __classPrivateFieldSet(this, _BrowserFetcher_platform, options.platform, "f");
        }
        else {
            const platform = os.platform();
            switch (platform) {
                case 'darwin':
                    switch (__classPrivateFieldGet(this, _BrowserFetcher_product, "f")) {
                        case 'chrome':
                            __classPrivateFieldSet(this, _BrowserFetcher_platform, os.arch() === 'arm64' && PUPPETEER_EXPERIMENTAL_CHROMIUM_MAC_ARM
                                ? 'mac_arm'
                                : 'mac', "f");
                            break;
                        case 'firefox':
                            __classPrivateFieldSet(this, _BrowserFetcher_platform, 'mac', "f");
                            break;
                        default:
                            throw new Error('unknown browser');
                    }
                    break;
                case 'linux':
                    __classPrivateFieldSet(this, _BrowserFetcher_platform, 'linux', "f");
                    break;
                case 'win32':
                    __classPrivateFieldSet(this, _BrowserFetcher_platform, os.arch() === 'x64' ? 'win64' : 'win32', "f");
                    return;
                default:
                    (0, assert_1.assert)(false, 'Unsupported platform: ' + platform);
            }
        }
        (0, assert_1.assert)(downloadURLs[__classPrivateFieldGet(this, _BrowserFetcher_product, "f")][__classPrivateFieldGet(this, _BrowserFetcher_platform, "f")], 'Unsupported platform: ' + __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"));
    }
    /**
     * @returns Returns the current `Platform`, which is one of `mac`, `linux`,
     * `win32` or `win64`.
     */
    platform() {
        return __classPrivateFieldGet(this, _BrowserFetcher_platform, "f");
    }
    /**
     * @returns Returns the current `Product`, which is one of `chrome` or
     * `firefox`.
     */
    product() {
        return __classPrivateFieldGet(this, _BrowserFetcher_product, "f");
    }
    /**
     * @returns The download host being used.
     */
    host() {
        return __classPrivateFieldGet(this, _BrowserFetcher_downloadHost, "f");
    }
    /**
     * Initiates a HEAD request to check if the revision is available.
     * @remarks
     * This method is affected by the current `product`.
     * @param revision - The revision to check availability for.
     * @returns A promise that resolves to `true` if the revision could be downloaded
     * from the host.
     */
    canDownload(revision) {
        const url = _downloadURL(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"), __classPrivateFieldGet(this, _BrowserFetcher_downloadHost, "f"), revision);
        return new Promise((resolve) => {
            const request = httpRequest(url, 'HEAD', (response) => {
                resolve(response.statusCode === 200);
            }, false);
            request.on('error', (error) => {
                console.error(error);
                resolve(false);
            });
        });
    }
    /**
     * Initiates a GET request to download the revision from the host.
     * @remarks
     * This method is affected by the current `product`.
     * @param revision - The revision to download.
     * @param progressCallback - A function that will be called with two arguments:
     * How many bytes have been downloaded and the total number of bytes of the download.
     * @returns A promise with revision information when the revision is downloaded
     * and extracted.
     */
    async download(revision, progressCallback = () => undefined) {
        const url = _downloadURL(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"), __classPrivateFieldGet(this, _BrowserFetcher_downloadHost, "f"), revision);
        const fileName = url.split('/').pop();
        (0, assert_1.assert)(fileName, `A malformed download URL was found: ${url}.`);
        const archivePath = path.join(__classPrivateFieldGet(this, _BrowserFetcher_downloadsFolder, "f"), fileName);
        const outputPath = __classPrivateFieldGet(this, _BrowserFetcher_instances, "m", _BrowserFetcher_getFolderPath).call(this, revision);
        if (await existsAsync(outputPath)) {
            return this.revisionInfo(revision);
        }
        if (!(await existsAsync(__classPrivateFieldGet(this, _BrowserFetcher_downloadsFolder, "f")))) {
            await mkdirAsync(__classPrivateFieldGet(this, _BrowserFetcher_downloadsFolder, "f"), {
                recursive: true,
            });
        }
        // Use system Chromium builds on Linux ARM devices
        if (os.platform() !== 'darwin' && os.arch() === 'arm64') {
            handleArm64();
            return;
        }
        try {
            await _downloadFile(url, archivePath, progressCallback);
            await install(archivePath, outputPath);
        }
        finally {
            if (await existsAsync(archivePath)) {
                await unlinkAsync(archivePath);
            }
        }
        const revisionInfo = this.revisionInfo(revision);
        if (revisionInfo) {
            await chmodAsync(revisionInfo.executablePath, 0o755);
        }
        return revisionInfo;
    }
    /**
     * @remarks
     * This method is affected by the current `product`.
     * @returns A promise with a list of all revision strings (for the current `product`)
     * available locally on disk.
     */
    async localRevisions() {
        if (!(await existsAsync(__classPrivateFieldGet(this, _BrowserFetcher_downloadsFolder, "f")))) {
            return [];
        }
        const fileNames = await readdirAsync(__classPrivateFieldGet(this, _BrowserFetcher_downloadsFolder, "f"));
        return fileNames
            .map((fileName) => {
            return parseFolderPath(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), fileName);
        })
            .filter((entry) => {
            var _a;
            return (_a = (entry && entry.platform === __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"))) !== null && _a !== void 0 ? _a : false;
        })
            .map((entry) => {
            return entry.revision;
        });
    }
    /**
     * @remarks
     * This method is affected by the current `product`.
     * @param revision - A revision to remove for the current `product`.
     * @returns A promise that resolves when the revision has been removes or
     * throws if the revision has not been downloaded.
     */
    async remove(revision) {
        const folderPath = __classPrivateFieldGet(this, _BrowserFetcher_instances, "m", _BrowserFetcher_getFolderPath).call(this, revision);
        (0, assert_1.assert)(await existsAsync(folderPath), `Failed to remove: revision ${revision} is not downloaded`);
        await (0, delete_directory_1.deleteDirectory)(folderPath);
    }
    /**
     * @param revision - The revision to get info for.
     * @returns The revision info for the given revision.
     */
    revisionInfo(revision) {
        const folderPath = __classPrivateFieldGet(this, _BrowserFetcher_instances, "m", _BrowserFetcher_getFolderPath).call(this, revision);
        let executablePath = '';
        if (__classPrivateFieldGet(this, _BrowserFetcher_product, "f") === 'chrome') {
            if (__classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'mac' || __classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'mac_arm') {
                executablePath = path.join(folderPath, archiveName(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"), revision), 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
            }
            else if (__classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'linux') {
                executablePath = path.join(folderPath, archiveName(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"), revision), 'chrome');
            }
            else if (__classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'win32' || __classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'win64') {
                executablePath = path.join(folderPath, archiveName(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"), revision), 'chrome.exe');
            }
            else {
                throw new Error('Unsupported platform: ' + __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"));
            }
        }
        else if (__classPrivateFieldGet(this, _BrowserFetcher_product, "f") === 'firefox') {
            if (__classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'mac' || __classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'mac_arm') {
                executablePath = path.join(folderPath, 'Firefox Nightly.app', 'Contents', 'MacOS', 'firefox');
            }
            else if (__classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'linux') {
                executablePath = path.join(folderPath, 'firefox', 'firefox');
            }
            else if (__classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'win32' || __classPrivateFieldGet(this, _BrowserFetcher_platform, "f") === 'win64') {
                executablePath = path.join(folderPath, 'firefox', 'firefox.exe');
            }
            else {
                throw new Error('Unsupported platform: ' + __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"));
            }
        }
        else {
            throw new Error('Unsupported product: ' + __classPrivateFieldGet(this, _BrowserFetcher_product, "f"));
        }
        const url = _downloadURL(__classPrivateFieldGet(this, _BrowserFetcher_product, "f"), __classPrivateFieldGet(this, _BrowserFetcher_platform, "f"), __classPrivateFieldGet(this, _BrowserFetcher_downloadHost, "f"), revision);
        const local = fs.existsSync(folderPath);
        return {
            revision,
            executablePath,
            folderPath,
            local,
            url,
            product: __classPrivateFieldGet(this, _BrowserFetcher_product, "f"),
        };
    }
}
exports.BrowserFetcher = BrowserFetcher;
_BrowserFetcher_product = new WeakMap(), _BrowserFetcher_downloadsFolder = new WeakMap(), _BrowserFetcher_downloadHost = new WeakMap(), _BrowserFetcher_platform = new WeakMap(), _BrowserFetcher_instances = new WeakSet(), _BrowserFetcher_getFolderPath = function _BrowserFetcher_getFolderPath(revision) {
    return path.resolve(__classPrivateFieldGet(this, _BrowserFetcher_downloadsFolder, "f"), `${__classPrivateFieldGet(this, _BrowserFetcher_platform, "f")}-${revision}`);
};
function parseFolderPath(product, folderPath) {
    const name = path.basename(folderPath);
    const splits = name.split('-');
    if (splits.length !== 2) {
        return;
    }
    const [platform, revision] = splits;
    if (!revision || !platform || !(platform in downloadURLs[product])) {
        return;
    }
    return { product, platform, revision };
}
function _downloadFile(url, destinationPath, progressCallback) {
    let fulfill;
    let reject;
    const promise = new Promise((x, y) => {
        fulfill = x;
        reject = y;
    });
    let downloadedBytes = 0;
    let totalBytes = 0;
    let lastProgress = Date.now();
    const request = httpRequest(url, 'GET', (response) => {
        if (response.statusCode !== 200) {
            const error = new Error(`Download failed: server returned code ${response.statusCode}. URL: ${url}`);
            // consume response data to free up memory
            response.resume();
            reject(error);
            return;
        }
        const file = fs.createWriteStream(destinationPath);
        file.on('finish', () => {
            return fulfill();
        });
        file.on('error', (error) => {
            return reject(error);
        });
        response.pipe(file);
        totalBytes = parseInt(response.headers['content-length'], 10);
        response.on('data', onData);
    });
    request.on('error', (error) => {
        return reject(error);
    });
    return promise;
    function onData(chunk) {
        downloadedBytes += chunk.length;
        if (Date.now() - lastProgress > 1000) {
            progressCallback(downloadedBytes, totalBytes);
            lastProgress = Date.now();
        }
    }
}
function install(archivePath, folderPath) {
    if (archivePath.endsWith('.zip')) {
        return (0, extract_zip_1.default)(archivePath, { dir: folderPath });
    }
    if (archivePath.endsWith('.tar.bz2')) {
        throw new Error('bz2 currently not implemented');
    }
    if (archivePath.endsWith('.dmg')) {
        return mkdirAsync(folderPath).then(() => {
            return _installDMG(archivePath, folderPath);
        });
    }
    throw new Error(`Unsupported archive format: ${archivePath}`);
}
function _installDMG(dmgPath, folderPath) {
    let mountPath;
    return new Promise((fulfill, reject) => {
        const mountCommand = `hdiutil attach -nobrowse -noautoopen "${dmgPath}"`;
        childProcess.exec(mountCommand, (err, stdout) => {
            if (err) {
                return reject(err);
            }
            const volumes = stdout.match(/\/Volumes\/(.*)/m);
            if (!volumes) {
                return reject(new Error(`Could not find volume path in ${stdout}`));
            }
            mountPath = volumes[0];
            readdirAsync(mountPath)
                .then((fileNames) => {
                const appName = fileNames.find((item) => {
                    return typeof item === 'string' && item.endsWith('.app');
                });
                if (!appName) {
                    return reject(new Error(`Cannot find app in ${mountPath}`));
                }
                const copyPath = path.join(mountPath, appName);
                childProcess.exec(`cp -R "${copyPath}" "${folderPath}"`, (_err) => {
                    if (_err) {
                        reject(_err);
                    }
                    else {
                        fulfill();
                    }
                });
            })
                .catch(reject);
        });
    })
        .catch((error) => {
        console.error(error);
    })
        .finally(() => {
        if (!mountPath) {
            return;
        }
        const unmountCommand = `hdiutil detach "${mountPath}" -quiet`;
        childProcess.exec(unmountCommand, (err) => {
            if (err) {
                console.error(`Error unmounting dmg: ${err}`);
            }
        });
    });
}
function httpRequest(url, method, response, keepAlive = true) {
    const urlParsed = URL.parse(url);
    const options = {
        ...urlParsed,
        method,
        headers: keepAlive
            ? {
                Connection: 'keep-alive',
            }
            : undefined,
    };
    const requestCallback = (res) => {
        if (res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location) {
            httpRequest(res.headers.location, method, response);
        }
        else {
            response(res);
        }
    };
    const request = options.protocol === 'https:'
        ? https.request(options, requestCallback)
        : http.request(options, requestCallback);
    request.end();
    return request;
}

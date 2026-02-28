"use strict";
/**
 * Copyright 2020 Google Inc. All rights reserved.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadBrowser = void 0;
const https_1 = __importDefault(require("https"));
const node_1 = require("./node");
const revisions_1 = require("./revisions");
const supportedProducts = {
    chrome: 'Chromium',
    firefox: 'Firefox Nightly',
};
async function downloadBrowser(product) {
    const browserFetcher = node_1.puppeteer.createBrowserFetcher({
        product,
        path: null,
        platform: null,
    });
    const revision = await getRevision();
    await fetchBinary(revision);
    async function getRevision() {
        if (product === 'chrome') {
            return Promise.resolve(revisions_1.PUPPETEER_REVISIONS.chromium);
        }
        if (product === 'firefox') {
            node_1.puppeteer._preferredRevision = revisions_1.PUPPETEER_REVISIONS.firefox;
            try {
                return await getFirefoxNightlyVersion();
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        }
        throw new Error(`Unsupported product ${product}`);
    }
    function fetchBinary(_revision) {
        const revisionInfo = browserFetcher.revisionInfo(_revision);
        // Do nothing if the revision is already downloaded.
        if (revisionInfo.local) {
            console.log(`${supportedProducts[product]} is already in ${revisionInfo.folderPath}; skipping download.`);
            return;
        }
        function onSuccess(localRevisions) {
            console.log(`${supportedProducts[product]} (${revisionInfo.revision}) downloaded to ${revisionInfo.folderPath}`);
            localRevisions = localRevisions.filter((__revision) => {
                return __revision !== revisionInfo.revision;
            });
            const cleanupOldVersions = localRevisions.map((__revision) => {
                return browserFetcher.remove(__revision);
            });
            Promise.all([...cleanupOldVersions]);
        }
        function onError(error) {
            console.error(`ERROR: Failed to set up ${supportedProducts[product]} r${_revision}! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.`);
            console.error(error);
            process.exit(1);
        }
        function onProgress(downloadedBytes, totalBytes) {
            console.log('Downloading', supportedProducts[product], toMegabytes(downloadedBytes) + '/' + toMegabytes(totalBytes));
        }
        return browserFetcher
            .download(revisionInfo.revision, onProgress)
            .then(() => {
            return browserFetcher.localRevisions();
        })
            .then(onSuccess)
            .catch(onError);
    }
    function toMegabytes(bytes) {
        const mb = bytes / 1024 / 1024;
        return `${Math.round(mb * 10) / 10} Mb`;
    }
    function getFirefoxNightlyVersion() {
        const firefoxVersionsUrl = 'https://product-details.mozilla.org/1.0/firefox_versions.json';
        const requestOptions = {};
        const promise = new Promise((resolve, reject) => {
            let data = '';
            console.log(`Requesting latest Firefox Nightly version from ${firefoxVersionsUrl}`);
            https_1.default
                .get(firefoxVersionsUrl, requestOptions, (r) => {
                if (r.statusCode && r.statusCode >= 400) {
                    return reject(new Error(`Got status code ${r.statusCode}`));
                }
                r.on('data', (chunk) => {
                    data += chunk;
                });
                r.on('end', () => {
                    try {
                        const versions = JSON.parse(data);
                        return resolve(versions.FIREFOX_NIGHTLY);
                    }
                    catch (_a) {
                        return reject(new Error('Firefox version not found'));
                    }
                });
            })
                .on('error', reject);
        });
        return promise;
    }
}
exports.downloadBrowser = downloadBrowser;

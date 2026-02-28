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
import type { Product } from './Product';
declare type Platform = 'linux' | 'mac' | 'mac_arm' | 'win32' | 'win64';
export interface BrowserFetcherOptions {
    platform: Platform | null;
    product: Product;
    path: string | null;
}
interface BrowserFetcherRevisionInfo {
    folderPath: string;
    executablePath: string;
    url: string;
    local: boolean;
    revision: string;
    product: string;
}
export declare class BrowserFetcher {
    #private;
    constructor(options: BrowserFetcherOptions);
    /**
     * @returns Returns the current `Platform`, which is one of `mac`, `linux`,
     * `win32` or `win64`.
     */
    platform(): Platform;
    /**
     * @returns Returns the current `Product`, which is one of `chrome` or
     * `firefox`.
     */
    product(): Product;
    /**
     * @returns The download host being used.
     */
    host(): string;
    /**
     * Initiates a HEAD request to check if the revision is available.
     * @remarks
     * This method is affected by the current `product`.
     * @param revision - The revision to check availability for.
     * @returns A promise that resolves to `true` if the revision could be downloaded
     * from the host.
     */
    canDownload(revision: string): Promise<boolean>;
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
    download(revision: string, progressCallback?: (x: number, y: number) => void): Promise<BrowserFetcherRevisionInfo | undefined>;
    /**
     * @remarks
     * This method is affected by the current `product`.
     * @returns A promise with a list of all revision strings (for the current `product`)
     * available locally on disk.
     */
    localRevisions(): Promise<string[]>;
    /**
     * @remarks
     * This method is affected by the current `product`.
     * @param revision - A revision to remove for the current `product`.
     * @returns A promise that resolves when the revision has been removes or
     * throws if the revision has not been downloaded.
     */
    remove(revision: string): Promise<void>;
    /**
     * @param revision - The revision to get info for.
     * @returns The revision info for the given revision.
     */
    revisionInfo(revision: string): BrowserFetcherRevisionInfo;
}
export {};

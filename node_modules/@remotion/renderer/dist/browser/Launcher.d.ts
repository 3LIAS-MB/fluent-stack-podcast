import { Browser } from './Browser';
import type { PuppeteerNodeLaunchOptions } from './LaunchOptions';
import type { Product } from './Product';
export interface ProductLauncher {
    launch(object: PuppeteerNodeLaunchOptions): Promise<Browser>;
    executablePath: (path?: any) => string;
    product: Product;
}
export default function Launcher(preferredRevision: string, product?: string): ProductLauncher;

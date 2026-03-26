import fs from 'fs';
import path from 'path';
import { DownloadedFile } from '../types';

const TEMP_DIR = process.cwd();

export async function downloadFile(url: string, suffix: string): Promise<string> {
  const https = require('https');
  const http = require('http');

  const cleanUrl = url.split('?')[0];
  const ext = path.extname(cleanUrl) || (suffix === 'audio' ? '.mp3' : '.jpg');
  const tempFile = path.join(TEMP_DIR, `temp-${suffix}-${Date.now()}${ext}`);

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    };

    protocol.get(url, options, (response: any) => {
      const displayUrl = url.length > 60 ? `${url.substring(0, 50)}...` : url;

      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  → Redirigiendo (${response.statusCode})`);
        downloadFile(response.headers.location, suffix).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Fallo al descargar ${suffix}: HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(tempFile);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(tempFile);
        if (stats.size < 500) {
          fs.unlink(tempFile, () => { });
          reject(new Error(`Archivo ${suffix} demasiado pequeño (${stats.size} bytes). Google Drive pudo haber bloqueado la descarga.`));
        } else {
          console.log(`  ✓ ${suffix} listo: ${path.basename(tempFile)} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve(tempFile);
        }
      });
    }).on('error', (err: Error) => {
      fs.unlink(tempFile, () => { });
      reject(err);
    });
  });
}

export async function downloadMultiple(
  urls: { url: string; suffix: string }[]
): Promise<{ path: string; suffix: string }[]> {
  const downloads = urls.map(({ url, suffix }) => downloadFile(url, suffix));
  const results = await Promise.all(downloads);
  return results.map((path, index) => ({
    path,
    suffix: urls[index].suffix,
  }));
}

export function getTempDir(): string {
  return TEMP_DIR;
}

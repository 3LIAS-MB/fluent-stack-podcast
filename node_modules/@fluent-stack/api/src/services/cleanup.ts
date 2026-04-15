import fs from 'fs';

export function cleanupFile(filePath: string): void {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, () => { });
  }
}

export function cleanupFiles(filePaths: string[]): void {
  filePaths.forEach(cleanupFile);
}

export function ensureOutputDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

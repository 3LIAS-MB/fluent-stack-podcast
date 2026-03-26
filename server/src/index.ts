import express from 'express';
import path from 'path';
import { createRenderRouter } from './routes/render';
import { getTempDir } from './services/download';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(express.json());

const TEMP_DIR = getTempDir();
const { getOutputDir } = require('./services/renderer');
const OUTPUT_DIR = getOutputDir();
const fs = require('fs');

app.use('/temp', express.static(TEMP_DIR, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

app.use('/videos', express.static(OUTPUT_DIR, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

app.post('/render', createRenderRouter(PORT));

app.delete('/clean-video/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(OUTPUT_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    fs.unlinkSync(filePath);
    console.log(`✓ Archivo eliminado: ${fileName}`);
    res.json({ success: true, message: `File ${fileName} deleted` });
  } catch (err) {
    console.error(`Error eliminando archivo: ${err}`);
    res.status(500).json({ success: false, error: String(err) });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, HOST, () => {
  console.log(`\nServidor de render ejecutándose en http://${HOST}:${PORT}`);
  console.log(`Endpoint: POST /render`);
  console.log(`Exposición de videos: http://${HOST}:${PORT}/videos`);
  console.log(`Parámetros adicionales:`);
  console.log(` - transcriptionMethod: "openai" | "local" (default: local)`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Puerto ${PORT} ya está en uso.`);
    console.error(`   Ejecuta: netstat -ano | findstr :${PORT}`);
    console.error(`   Luego:   taskkill /F /PID <el_PID>`);
    process.exit(1);
  } else {
    throw err;
  }
});

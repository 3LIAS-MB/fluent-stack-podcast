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

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; background: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <h1 style="color: #38bdf8;">🎙️ Fluent Stack API</h1>
        <p>Servidor de Renderizado Activo</p>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155;">
          <p><strong>Endpoint:</strong> POST /render</p>
          <p><strong>Salida:</strong> /videos</p>
          <p><strong>Status:</strong> <span style="color: #4ade80;">Online</span></p>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

import { execSync } from 'child_process';

/**
 * Intenta liberar el puerto si está ocupado por un proceso zombie de Node.
 */
function ensurePortFree(port: number) {
  if (process.platform !== 'win32') return;

  try {
    const output = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`).toString();
    const lines = output.trim().split('\n');

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];

      if (pid && pid !== '0' && pid !== process.pid.toString()) {
        console.log(`   Liberando puerto ${port} (PID: ${pid})...`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`   Puerto ${port} liberado.`);
        } catch (e) {
          // Ya pudo haber sido cerrado
        }
      }
    }
  } catch (err) {
    // Si findstr no encuentra nada, lanza error, lo ignoramos
  }
}

// Logger de 404 para Chrome (Remotion)
app.use((req, res, next) => {
  console.log(`[Express 404] No se encontró: ${req.method} ${req.originalUrl}`);
  res.status(404).send('Not Found');
});

// Liberar puerto antes de arrancar
ensurePortFree(PORT);

const server = app.listen(PORT, HOST, () => {
  // Eliminamos el clear para no perder el historial de errores si ts-node-dev reinicia
  console.log(`\n🎙️  Fluent Stack API | Online en http://${HOST}:${PORT}`);
  console.log(`  → Endpoint: POST /render`);
  console.log(`  → Videos:   http://0.0.0.0:${PORT}/videos`);
  console.log(`  → UI: http://localhost:${PORT}`);
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n Cerrando servidor (SIGINT)...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n Cerrando servidor (SIGTERM)...');
  server.close(() => {
    process.exit(0);
  });
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: El puerto ${PORT} no pudo ser liberado automáticamente.`);
    process.exit(1);
  } else {
    throw err;
  }
});


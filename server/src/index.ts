import express from 'express';
import path from 'path';
import { createRenderRouter } from './routes/render';
import { getTempDir } from './services/download';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(express.json());

const TEMP_DIR = getTempDir();
app.use('/temp', express.static(TEMP_DIR, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

app.post('/render', createRenderRouter(PORT));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`\nServidor de render ejecutándose en http://localhost:${PORT}`);
  console.log(`Endpoint: POST /render`);
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

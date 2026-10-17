import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './src/server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeForge server running on port ${PORT}`);
  });
}

// Only start the listener if running as a direct Node process, not in serverless environments
if (!process.env.NETLIFY && process.env.LAMBDA_TASK_ROOT === undefined) {
  startServer();
}

export { app };

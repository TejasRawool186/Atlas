import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { investigationsRouter } from './backend/routes/investigations.ts';
import { certificatesRouter } from './backend/routes/certificates.ts';
import { sanityRouter } from './backend/routes/sanity.ts';
import { systemRouter } from './backend/routes/system.ts';
import { atlasConfig } from './backend/config/env.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.use('/api/investigations', investigationsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/sanity', sanityRouter);
app.use('/api', systemRouter);

async function startServer() {
  const isProduction = atlasConfig.nodeEnv === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(atlasConfig.port, '0.0.0.0', () => {
    console.log(`[ATLAS] Server running on http://0.0.0.0:${atlasConfig.port}`);
    console.log(`[ATLAS] LLM: ${isProduction ? 'production' : 'development'} mode`);
    console.log(`[ATLAS] Sanity: ${atlasConfig.sanity.isConfigured ? `live (project: ${atlasConfig.sanity.projectId})` : 'local-corpus (configure SANITY_PROJECT_ID + SANITY_API_TOKEN for live)'}`);
  });
}

startServer().catch(err => {
  console.error('[ATLAS] Fatal boot error:', err);
  process.exit(1);
});

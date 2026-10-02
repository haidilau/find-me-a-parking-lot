import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import API handlers directly from the /api folder
import healthHandler from './api/health.js';
import liveLotsHandler from './api/live-lots.js';
import hdbInfoHandler from './api/hdb-info.js';
import hdbAvailabilityHandler from './api/hdb-availability.js';
import carParkDetailsHandler from './api/car-park-details.js';
import evChargingHandler from './api/ev-charging.js';
import carparksHandler from './api/carparks.js';
import uraTokenHandler from './api/ura-token.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Routes
app.all(['/api/health', '/api/health.js'], (req: Request, res: Response) => {
  return healthHandler(req, res);
});

app.all(['/api/hdb-info', '/api/hdb-info.js'], (req: Request, res: Response) => {
  return hdbInfoHandler(req, res);
});

app.all(['/api/hdb-availability', '/api/hdb-availability.js'], (req: Request, res: Response) => {
  return hdbAvailabilityHandler(req, res);
});

app.all(['/api/live-lots', '/api/live-lots.js', '/api/ura-availability', '/api/ura-availability.js'], (req: Request, res: Response) => {
  return liveLotsHandler(req, res);
});

app.all(['/api/car-park-details', '/api/car-park-details.js', '/api/ura-details', '/api/ura-details.js'], (req: Request, res: Response) => {
  return carParkDetailsHandler(req, res);
});

app.all(['/api/ev-charging', '/api/ev-charging.js'], (req: Request, res: Response) => {
  return evChargingHandler(req, res);
});

app.all(['/api/carparks', '/api/carparks.js'], (req: Request, res: Response) => {
  return carparksHandler(req, res);
});

app.all(['/api/ura-token', '/api/ura-token.js'], (req: Request, res: Response) => {
  return uraTokenHandler(req, res);
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite dev server middleware in development
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ParkSG Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[ParkSG Server] Health endpoint: http://localhost:${PORT}/api/health.js`);
  });
}

startServer().catch((err) => {
  console.error('[ParkSG Server] Startup failure:', err);
  process.exit(1);
});

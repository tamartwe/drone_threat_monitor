import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { createDroneStore, DroneStore } from './dal/drone.store';
import { ConflictError, NotFoundError, ValidationError } from './lib/errors';
import { logger } from './lib/logger';
import { createDroneController } from './controllers/drone.controller';
import { createDroneRouter } from './routes/drone.routes';
import { createDroneService } from './services/drone.service';

export interface AppDeps {
  droneStore?: DroneStore;
}

export function createApp(deps: AppDeps = {}) {
  const droneStore = deps.droneStore ?? createDroneStore();
  const droneSvc = createDroneService(droneStore);
  const droneCtrl = createDroneController(droneSvc);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/drones', createDroneRouter(droneCtrl));

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof ConflictError) {
      res.status(409).json({ error: err.message });
      return;
    }
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message, details: err.details });
      return;
    }
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

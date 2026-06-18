import { createApp } from './app';
import { createDroneStore } from './dal/drone.store';
import { logger } from './lib/logger';
import { SEED_EVENTS } from './lib/seed';

const PORT = Number(process.env['PORT'] ?? 3001);

const droneStore = createDroneStore(SEED_EVENTS);
const app = createApp({ droneStore });

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, seeded: SEED_EVENTS.length }, 'Drone Threat Monitor API started');
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    logger.fatal(
      { port: PORT, pid: process.pid },
      `Port ${PORT} is already in use. Kill the process occupying it or set a different PORT in .env`,
    );
  } else {
    logger.fatal({ err }, 'Server failed to start');
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
  process.exit(1);
});

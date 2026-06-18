import { Router } from 'express';
import { createDroneController } from '../controllers/drone.controller';

export function createDroneRouter(controller: ReturnType<typeof createDroneController>): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.updateStatus);
  return router;
}

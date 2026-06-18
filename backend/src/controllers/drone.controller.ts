import { NextFunction, Request, Response } from 'express';
import { DroneService } from '../services/drone.service';
import { createDroneSchema, listDroneQuerySchema, updateDroneSchema } from '../schemas/drone.schema';

export function createDroneController(svc: DroneService) {
  return {
    list(req: Request, res: Response, next: NextFunction): void {
      try {
        const parsed = listDroneQuerySchema.safeParse(req.query);
        if (!parsed.success) {
          res.status(400).json({ error: 'Invalid query params', details: parsed.error.flatten() });
          return;
        }
        const { page, limit, status, threatLevel } = parsed.data;
        const result = svc.list(page, limit, { status, threatLevel });
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    },

    create(req: Request, res: Response, next: NextFunction): void {
      try {
        const parsed = createDroneSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
          return;
        }
        const drone = svc.create(parsed.data);
        res.status(201).json(drone);
      } catch (err) {
        next(err);
      }
    },

    getById(req: Request, res: Response, next: NextFunction): void {
      try {
        const id = String(req.params['id']);
        const drone = svc.getById(id);
        res.status(200).json(drone);
      } catch (err) {
        next(err);
      }
    },

    updateStatus(req: Request, res: Response, next: NextFunction): void {
      try {
        const id = String(req.params['id']);
        const parsed = updateDroneSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
          return;
        }
        const drone = svc.updateStatus(id, parsed.data);
        res.status(200).json(drone);
      } catch (err) {
        next(err);
      }
    },
  };
}

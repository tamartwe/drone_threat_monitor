import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../lib/errors';
import { DroneService } from '../services/drone.service';
import { createDroneSchema, listDroneQuerySchema, updateDroneSchema } from '../schemas/drone.schema';

function validate<T>(
  result: { success: true; data: T } | { success: false; error: { flatten(): unknown } },
  message: string,
): T {
  if (!result.success) throw new ValidationError(message, result.error.flatten());
  return result.data;
}

export function createDroneController(svc: DroneService) {
  return {
    list(req: Request, res: Response, next: NextFunction): void {
      try {
        const { page, limit, status, threatLevel } = validate(
          listDroneQuerySchema.safeParse(req.query),
          'Invalid query params',
        );
        res.status(200).json(svc.list(page, limit, { status, threatLevel }));
      } catch (err) {
        next(err);
      }
    },

    create(req: Request, res: Response, next: NextFunction): void {
      try {
        const input = validate(createDroneSchema.safeParse(req.body), 'Invalid request body');
        res.status(201).json(svc.create(input));
      } catch (err) {
        next(err);
      }
    },

    getById(req: Request, res: Response, next: NextFunction): void {
      try {
        res.status(200).json(svc.getById(String(req.params['id'])));
      } catch (err) {
        next(err);
      }
    },

    updateStatus(req: Request, res: Response, next: NextFunction): void {
      try {
        const id = String(req.params['id']);
        const input = validate(updateDroneSchema.safeParse(req.body), 'Invalid request body');
        res.status(200).json(svc.updateStatus(id, input));
      } catch (err) {
        next(err);
      }
    },
  };
}

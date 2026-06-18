import { randomUUID } from 'crypto';
import { DroneStore } from '../dal/drone.store';
import { DroneEvent, DroneFilters, PaginatedResult } from '../types';
import { CreateDroneInput, UpdateDroneInput } from '../schemas/drone.schema';
import { NotFoundError, ConflictError } from '../lib/errors';

export function createDroneService(store: DroneStore) {
  return {
    create(input: CreateDroneInput): DroneEvent {
      const drone: DroneEvent = {
        id: randomUUID(),
        label: input.label,
        threatLevel: input.threatLevel,
        detectedAt: new Date().toISOString(),
        status: 'active',
      };
      store.save(drone);
      return drone;
    },

    getById(id: string): DroneEvent {
      const drone = store.findById(id);
      if (!drone) throw new NotFoundError(`Drone '${id}' not found`);
      return drone;
    },

    list(page: number, limit: number, filters?: DroneFilters): PaginatedResult<DroneEvent> {
      return store.findPaginated(page, limit, filters);
    },

    updateStatus(id: string, input: UpdateDroneInput): DroneEvent {
      const existing = store.findById(id);
      if (!existing) throw new NotFoundError(`Drone '${id}' not found`);
      if (existing.status !== 'active') {
        throw new ConflictError(
          `Drone '${id}' cannot be updated — it is already '${existing.status}'`,
        );
      }
      const updated = store.update(id, { status: input.status });
      return updated!;
    },
  };
}

export type DroneService = ReturnType<typeof createDroneService>;

import { DroneEvent, DroneFilters, PaginatedResult } from '../types';

export interface DroneStore {
  save(drone: DroneEvent): void;
  findById(id: string): DroneEvent | undefined;
  update(id: string, patch: Partial<DroneEvent>): DroneEvent | undefined;
  findPaginated(page: number, limit: number, filters?: DroneFilters): PaginatedResult<DroneEvent>;
}

export function createDroneStore(initial: DroneEvent[] = []): DroneStore {
  const events: DroneEvent[] = [...initial];

  return {
    save(drone) {
      events.push(drone);
    },

    findById(id) {
      return events.find((d) => d.id === id);
    },

    update(id, patch) {
      const idx = events.findIndex((d) => d.id === id);
      if (idx === -1) return undefined;
      events[idx] = { ...events[idx], ...patch } as DroneEvent;
      return events[idx];
    },

    findPaginated(page, limit, filters = {}) {
      let filtered = events.filter((d) => {
        if (filters.status && d.status !== filters.status) return false;
        if (filters.threatLevel && d.threatLevel !== filters.threatLevel) return false;
        return true;
      });

      filtered.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

      const total = filtered.length;
      if (total === 0) return { data: [], total: 0, totalPages: 0, page, limit };

      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
      };
    },
  };
}

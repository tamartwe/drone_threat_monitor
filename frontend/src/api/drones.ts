import { DroneEvent, DroneFilters, PaginatedResult, TriageStatus } from '../types';

const BASE = '/api';

async function parseError(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error((body as { error?: string }).error ?? `Request failed with status ${res.status}`);
}

export async function listDrones(
  filters: DroneFilters = {},
  page = 1,
  limit = 20,
): Promise<PaginatedResult<DroneEvent>> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.status) params.set('status', filters.status);
  if (filters.threatLevel) params.set('threatLevel', filters.threatLevel);

  const res = await fetch(`${BASE}/drones?${params.toString()}`);
  if (!res.ok) await parseError(res);
  return res.json() as Promise<PaginatedResult<DroneEvent>>;
}

export async function updateDroneStatus(id: string, status: TriageStatus): Promise<DroneEvent> {
  const res = await fetch(`${BASE}/drones/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await parseError(res);
  return res.json() as Promise<DroneEvent>;
}

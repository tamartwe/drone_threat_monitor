export type ThreatLevel = 'low' | 'medium' | 'high';
export type DroneStatus = 'active' | 'mitigated' | 'dismissed';
export type TriageStatus = 'mitigated' | 'dismissed';

export interface DroneEvent {
  id: string;
  label: string;
  threatLevel: ThreatLevel;
  detectedAt: string;
  status: DroneStatus;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface DroneFilters {
  status?: DroneStatus;
  threatLevel?: ThreatLevel;
}

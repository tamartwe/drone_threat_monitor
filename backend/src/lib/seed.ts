import { DroneEvent } from '../types';

const minutesAgo = (n: number): string =>
  new Date(Date.now() - n * 60 * 1000).toISOString();

export const SEED_EVENTS: DroneEvent[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    label: 'DJI-Phantom-4 #A1',
    threatLevel: 'high',
    detectedAt: minutesAgo(2),
    status: 'active',
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    label: 'Mavic-Pro #B7',
    threatLevel: 'medium',
    detectedAt: minutesAgo(8),
    status: 'active',
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    label: 'Autel-EVO #C3',
    threatLevel: 'low',
    detectedAt: minutesAgo(15),
    status: 'mitigated',
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    label: 'Skydio-2 #D9',
    threatLevel: 'high',
    detectedAt: minutesAgo(22),
    status: 'dismissed',
  },
  {
    id: '11111111-0000-0000-0000-000000000005',
    label: 'DJI-Mini-3 #E2',
    threatLevel: 'medium',
    detectedAt: minutesAgo(35),
    status: 'active',
  },
];

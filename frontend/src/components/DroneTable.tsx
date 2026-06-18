import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listDrones, updateDroneStatus } from '../api/drones';
import { DroneEvent, DroneFilters, TriageStatus } from '../types';
import StatusBadge from './StatusBadge';
import ThreatBadge from './ThreatBadge';

interface Props {
  filters: DroneFilters;
}

export default function DroneTable({ filters }: Props) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['drones', filters],
    queryFn: () => listDrones(filters),
  });

  /*
   * Refetch approach: on a successful PATCH, invalidate the ['drones'] query so
   * React Query re-fetches from the server. Always consistent with the server state
   * at the cost of one extra round-trip.
   *
   * Alternative — optimistic update: immediately mutate the cached data in
   * onMutate, then rollback via context in onError. Faster perceived UX, but adds
   * rollback logic and can cause a flicker if the server rejects the change.
   */
  const { mutate: triage, isPending: isTriaging, variables: triageVars } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TriageStatus }) =>
      updateDroneStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
    },
  });

  if (isLoading) {
    return (
      <div className="state-box">
        <span className="spinner" aria-hidden="true" />
        <span>Loading drone events…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="state-box state-box--error">
        <strong>Failed to load drone events</strong>
        <p>{(error as Error).message}</p>
        <button
          className="btn btn--retry"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['drones'] })}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="state-box">
        <span>No drone events match the current filters.</span>
      </div>
    );
  }

  return (
    <div className="table-card">
      <p className="result-count">
        {data.total} event{data.total !== 1 ? 's' : ''}
      </p>
      <div className="table-scroll">
        <table className="drone-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Threat level</th>
              <th>Status</th>
              <th>Detected at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((drone: DroneEvent) => {
              const isBeingTriaged = isTriaging && triageVars?.id === drone.id;
              const isActive = drone.status === 'active';

              return (
                <tr key={drone.id} data-threat={drone.threatLevel}>
                  <td className="cell-label">{drone.label}</td>
                  <td>
                    <ThreatBadge level={drone.threatLevel} />
                  </td>
                  <td>
                    <StatusBadge status={drone.status} />
                  </td>
                  <td className="cell-time">
                    {new Date(drone.detectedAt).toLocaleString()}
                  </td>
                  <td className="cell-actions">
                    <button
                      className="btn btn--mitigate"
                      disabled={!isActive || isTriaging}
                      aria-label={`Mitigate ${drone.label}`}
                      onClick={() => triage({ id: drone.id, status: 'mitigated' })}
                    >
                      {isBeingTriaged ? '…' : 'Mitigate'}
                    </button>
                    <button
                      className="btn btn--dismiss"
                      disabled={!isActive || isTriaging}
                      aria-label={`Dismiss ${drone.label}`}
                      onClick={() => triage({ id: drone.id, status: 'dismissed' })}
                    >
                      {isBeingTriaged ? '…' : 'Dismiss'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

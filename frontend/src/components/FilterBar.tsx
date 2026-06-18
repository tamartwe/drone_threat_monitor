import { DroneFilters, DroneStatus, ThreatLevel } from '../types';

interface Props {
  filters: DroneFilters;
  onChange: (next: DroneFilters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="filter-bar">
      <label className="filter-item">
        <span className="filter-label">Status</span>
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            onChange({ ...filters, status: (e.target.value as DroneStatus) || undefined })
          }
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="mitigated">Mitigated</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </label>

      <label className="filter-item">
        <span className="filter-label">Threat level</span>
        <select
          value={filters.threatLevel ?? ''}
          onChange={(e) =>
            onChange({ ...filters, threatLevel: (e.target.value as ThreatLevel) || undefined })
          }
        >
          <option value="">All levels</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      {(filters.status || filters.threatLevel) && (
        <button className="btn-clear" onClick={() => onChange({})}>
          Clear filters
        </button>
      )}
    </div>
  );
}

import { DroneStatus } from '../types';

const STYLES: Record<DroneStatus, React.CSSProperties> = {
  active: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  mitigated: { backgroundColor: '#f3f4f6', color: '#374151' },
  dismissed: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
};

const LABELS: Record<DroneStatus, string> = {
  active: 'Active',
  mitigated: 'Mitigated',
  dismissed: 'Dismissed',
};

interface Props {
  status: DroneStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className="badge" style={STYLES[status]}>
      {LABELS[status]}
    </span>
  );
}

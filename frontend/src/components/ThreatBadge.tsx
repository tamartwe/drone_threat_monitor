import { ThreatLevel } from '../types';

const STYLES: Record<ThreatLevel, React.CSSProperties> = {
  high: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  medium: { backgroundColor: '#fef3c7', color: '#92400e' },
  low: { backgroundColor: '#dcfce7', color: '#166534' },
};

interface Props {
  level: ThreatLevel;
}

export default function ThreatBadge({ level }: Props) {
  return (
    <span className="badge" style={STYLES[level]}>
      {level.toUpperCase()}
    </span>
  );
}

import type { AktivnostStatus } from '../../../models/Trip';

const map: Record<AktivnostStatus, string> = {
  planirano: 'status-planirano',
  rezervisano: 'status-rezervisano',
  završeno: 'status-zavrseno',
  otkazano: 'status-otkazano',
};

export function StatusPill({ status }: { status: AktivnostStatus }) {
  return <span className={`status ${map[status]}`}>{status}</span>;
}

import type { Aktivnost } from '../../../models/Trip';
import { fmtCurrency, fmtDateShort } from '../../../lib/format';
import { Icon } from '../../ui/Icon';
import { StatusPill } from './StatusPill';

export function ActivityRow({ activity }: { activity: Aktivnost }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 14,
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
      }}
    >
      <div style={{ minWidth: 80 }}>
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.1em',
            color: 'var(--ink-3)',
            whiteSpace: 'nowrap',
          }}
        >
          {fmtDateShort(activity.datum).toUpperCase()}
        </div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>
          {activity.vrijeme}
        </div>
      </div>
      <div style={{ width: 1, height: 32, background: 'var(--rule)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{activity.naziv}</div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--ink-3)',
            marginTop: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon.pin /> {activity.lokacija}
        </div>
      </div>
      {activity.trosak > 0 && (
        <span className="mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
          {fmtCurrency(activity.trosak)}
        </span>
      )}
      <StatusPill status={activity.status} />
    </div>
  );
}

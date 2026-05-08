import type { AdminTripDto } from '../../dto/admin.dto';
import type { User } from '../../models/User';
import { daysBetween, fmtCurrency, fmtDateShort } from '../../lib/format';

interface Props {
  trips: AdminTripDto[];
  users: User[];
}

export function AllTripsTable({ trips, users }: Props) {
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 160px 100px 200px',
          gap: 16,
          padding: '12px 20px',
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        {['Plan', 'Vlasnik', 'Datumi', 'Trajanje', 'Statistika'].map((h, i) => (
          <div
            key={i}
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
            }}
          >
            {h}
          </div>
        ))}
      </div>
      {trips.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: 'center',
            color: 'var(--ink-3)',
            fontSize: 13,
          }}
        >
          Nema planova u sistemu.
        </div>
      ) : (
        trips.map((t) => {
          const owner = userById.get(t.userId);
          const procenat = t.budzet
            ? Math.min(100, Math.round((t.potroseno / t.budzet) * 100))
            : 0;
          return (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 160px 100px 200px',
                gap: 16,
                padding: '14px 20px',
                borderBottom: '1px solid var(--rule)',
                alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 18, lineHeight: 1.2 }}>
                  {t.naziv}
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: 'var(--ink-3)',
                    marginTop: 2,
                  }}
                >
                  ID: {t.id.slice(0, 8)}…
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13 }}>
                  {owner?.ime ?? <span style={{ color: 'var(--ink-3)' }}>—</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {owner?.email ?? t.userId}
                </div>
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  whiteSpace: 'nowrap',
                }}
              >
                {fmtDateShort(t.pocetak)} → {fmtDateShort(t.kraj)}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  color: 'var(--ink-3)',
                }}
              >
                {daysBetween(t.pocetak, t.kraj)} dana
              </span>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    marginBottom: 4,
                    color: 'var(--ink-2)',
                  }}
                >
                  <span>
                    {fmtCurrency(t.potroseno, t.valuta)} /{' '}
                    {fmtCurrency(t.budzet, t.valuta)}
                  </span>
                  <span style={{ color: procenat > 90 ? 'var(--danger)' : 'var(--ink-3)' }}>
                    {procenat}%
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    fontSize: 11,
                    color: 'var(--ink-3)',
                  }}
                >
                  <span>D: {t.destinacije}</span>
                  <span>A: {t.aktivnosti}</span>
                  <span>T: {t.troskovi}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

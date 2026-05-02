import type { Trip } from '../../models/Trip';
import { daysBetween, fmtCurrency, fmtDateShort } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface Props {
  trip: Trip;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 9,
          letterSpacing: '0.14em',
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div className="serif" style={{ fontSize: 20, lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  );
}

export function TripCard({ trip, index, onOpen, onDelete }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const status: 'završeno' | 'u toku' | 'predstoji' =
    trip.kraj < today ? 'završeno' : trip.pocetak <= today ? 'u toku' : 'predstoji';
  const dani = daysBetween(trip.pocetak, trip.kraj);
  const trosak = trip.troskovi.reduce((s, t) => s + t.iznos, 0);
  const procenat = trip.budzet
    ? Math.min(100, Math.round((trosak / trip.budzet) * 100))
    : 0;

  return (
    <div className="card fade-in" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Cover */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16/10',
          overflow: 'hidden',
          background: 'var(--bg-2)',
        }}
      >
        {trip.kover ? (
          <img
            src={trip.kover}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="stripe-ph" style={{ width: '100%', height: '100%' }}>
            cover
          </div>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span
            className="chip mono"
            style={{
              background: 'rgba(251,247,240,0.92)',
              backdropFilter: 'blur(4px)',
            }}
          >
            №.{String(index + 1).padStart(2, '0')}
          </span>
          <span
            className="chip mono"
            style={{
              background:
                status === 'u toku'
                  ? 'var(--terra)'
                  : status === 'predstoji'
                    ? 'rgba(251,247,240,0.92)'
                    : 'var(--ink)',
              color:
                status === 'u toku' || status === 'završeno'
                  ? 'var(--paper)'
                  : 'var(--ink)',
              backdropFilter: 'blur(4px)',
              borderColor: 'transparent',
            }}
          >
            {status}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
          <span
            className="chip mono"
            style={{
              background: 'rgba(26,22,18,0.85)',
              color: 'var(--paper)',
              backdropFilter: 'blur(4px)',
              borderColor: 'transparent',
            }}
          >
            {dani} dana
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
        }}
      >
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {fmtDateShort(trip.pocetak)} — {fmtDateShort(trip.kraj)}
          </div>
          <div
            className="serif"
            style={{ fontSize: 26, lineHeight: 1.05, letterSpacing: '-0.01em' }}
          >
            {trip.naziv}
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {trip.opis}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            padding: '12px 0',
            borderTop: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
          }}
        >
          <Stat label="Destinacije" value={trip.destinacije.length} />
          <Stat label="Aktivnosti" value={trip.aktivnosti.length} />
          <Stat label="Iskorišćeno" value={`${procenat}%`} />
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            <span style={{ color: 'var(--ink-3)' }}>
              {fmtCurrency(trosak, trip.valuta)} / {fmtCurrency(trip.budzet, trip.valuta)}
            </span>
            <span style={{ color: procenat > 90 ? 'var(--danger)' : 'var(--ink-2)' }}>
              {fmtCurrency(trip.budzet - trosak, trip.valuta)} preostalo
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: 'var(--bg-2)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${procenat}%`,
                height: '100%',
                background: procenat > 90 ? 'var(--danger)' : 'var(--terra)',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            className="btn btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onOpen}
          >
            Otvori plan <Icon.arrow />
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={onDelete}
            aria-label="Obriši"
          >
            <Icon.trash />
          </button>
        </div>
      </div>
    </div>
  );
}

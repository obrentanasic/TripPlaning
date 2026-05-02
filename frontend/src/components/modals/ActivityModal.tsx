import { useState } from 'react';
import type { Aktivnost, AktivnostStatus } from '../../models/Trip';
import { fmtDate } from '../../lib/format';

interface Props {
  activity: Partial<Aktivnost> | null;
  days: string[];
  onSave: (a: Aktivnost | (Omit<Aktivnost, 'id'> & { id?: string })) => void;
  onCancel: () => void;
}

const STATUSI: { id: AktivnostStatus; label: string }[] = [
  { id: 'planirano', label: 'Planirano' },
  { id: 'rezervisano', label: 'Rezervisano' },
  { id: 'završeno', label: 'Završeno' },
  { id: 'otkazano', label: 'Otkazano' },
];

export function ActivityModal({ activity, days, onSave, onCancel }: Props) {
  const [f, setF] = useState<Partial<Aktivnost>>({
    naziv: '',
    datum: days[0] || '',
    vrijeme: '09:00',
    lokacija: '',
    opis: '',
    trosak: 0,
    status: 'planirano',
    ...(activity || {}),
  });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!f.naziv?.trim()) return setError('Naziv je obavezan.');
    if (typeof f.trosak === 'number' && f.trosak < 0)
      return setError('Trošak ne može biti negativan.');
    if (f.datum && days.length > 0 && !days.includes(f.datum))
      return setError('Datum mora biti u okviru putovanja.');
    onSave(f as Aktivnost);
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--rule)' }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 6,
            }}
          >
            {activity?.id ? 'Izmjena aktivnosti' : 'Nova aktivnost'}
          </div>
          <h2
            className="serif"
            style={{ fontSize: 28, margin: 0, fontWeight: 400 }}
          >
            {f.naziv || 'Nova aktivnost'}
          </h2>
        </div>
        <div
          style={{
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                padding: 10,
                background: 'rgba(168,52,30,0.08)',
                color: 'var(--danger)',
                fontSize: 13,
                border: '1px solid var(--danger)',
              }}
            >
              {error}
            </div>
          )}
          <div className="field">
            <label>Naziv</label>
            <input
              value={f.naziv}
              onChange={(e) => setF({ ...f, naziv: e.target.value })}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Datum</label>
              {days.length > 0 ? (
                <select
                  value={f.datum}
                  onChange={(e) => setF({ ...f, datum: e.target.value })}
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {fmtDate(d)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={f.datum}
                  onChange={(e) => setF({ ...f, datum: e.target.value })}
                />
              )}
            </div>
            <div className="field">
              <label>Vrijeme</label>
              <input
                type="time"
                value={f.vrijeme}
                onChange={(e) => setF({ ...f, vrijeme: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Lokacija</label>
            <input
              value={f.lokacija}
              onChange={(e) => setF({ ...f, lokacija: e.target.value })}
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Procijenjeni trošak (EUR)</label>
              <input
                type="number"
                min={0}
                value={f.trosak}
                onChange={(e) =>
                  setF({ ...f, trosak: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select
                value={f.status}
                onChange={(e) =>
                  setF({ ...f, status: e.target.value as AktivnostStatus })
                }
              >
                {STATUSI.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Opis</label>
            <textarea
              value={f.opis}
              onChange={(e) => setF({ ...f, opis: e.target.value })}
            />
          </div>
        </div>
        <div
          style={{
            padding: 20,
            borderTop: '1px solid var(--rule)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button className="btn btn-ghost" onClick={onCancel}>
            Otkaži
          </button>
          <button className="btn btn-terra" onClick={submit}>
            Sačuvaj
          </button>
        </div>
      </div>
    </div>
  );
}

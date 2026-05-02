import { useState } from 'react';
import type { Trosak, KategorijaTroska } from '../../models/Trip';
import { KATEGORIJE_TROSKOVA } from '../../models/Trip';

interface Props {
  expense: Partial<Trosak> | null;
  onSave: (t: Trosak | (Omit<Trosak, 'id'> & { id?: string })) => void;
  onCancel: () => void;
}

export function ExpenseModal({ expense, onSave, onCancel }: Props) {
  const [f, setF] = useState<Partial<Trosak>>({
    naziv: '',
    kategorija: 'ostalo',
    iznos: 0,
    datum: new Date().toISOString().split('T')[0],
    opis: '',
    ...(expense || {}),
  });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!f.naziv?.trim()) return setError('Naziv je obavezan.');
    if (typeof f.iznos === 'number' && f.iznos < 0)
      return setError('Iznos ne može biti negativan.');
    onSave(f as Trosak);
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
            {expense?.id ? 'Izmjena troška' : 'Novi trošak'}
          </div>
          <h2
            className="serif"
            style={{ fontSize: 28, margin: 0, fontWeight: 400 }}
          >
            {f.naziv || 'Novi trošak'}
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
              <label>Kategorija</label>
              <select
                value={f.kategorija}
                onChange={(e) =>
                  setF({ ...f, kategorija: e.target.value as KategorijaTroska })
                }
              >
                {KATEGORIJE_TROSKOVA.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.naziv}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Iznos</label>
              <input
                type="number"
                min={0}
                value={f.iznos}
                onChange={(e) =>
                  setF({ ...f, iznos: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="field">
            <label>Datum</label>
            <input
              type="date"
              value={f.datum}
              onChange={(e) => setF({ ...f, datum: e.target.value })}
            />
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

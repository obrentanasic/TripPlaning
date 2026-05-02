import { useState } from 'react';
import type { Destinacija } from '../../models/Trip';

interface Props {
  dest: Partial<Destinacija> | null;
  onSave: (d: Destinacija | (Omit<Destinacija, 'id'> & { id?: string })) => void;
  onCancel: () => void;
}

export function DestinationModal({ dest, onSave, onCancel }: Props) {
  const [f, setF] = useState({
    naziv: '',
    lokacija: '',
    dolazak: '',
    odlazak: '',
    opis: '',
    foto: '',
    ...(dest || {}),
  });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!f.naziv.trim()) return setError('Naziv je obavezan.');
    if (f.dolazak && f.odlazak && f.odlazak < f.dolazak)
      return setError('Datum odlaska mora biti poslije dolaska.');
    onSave({
      ...(f as Destinacija),
      foto: f.foto?.trim() || undefined,
    });
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
            {dest?.id ? 'Izmjena destinacije' : 'Nova destinacija'}
          </div>
          <h2
            className="serif"
            style={{ fontSize: 28, margin: 0, fontWeight: 400 }}
          >
            {f.naziv || 'Nova destinacija'}
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
              placeholder="npr. Tokio"
            />
          </div>
          <div className="field">
            <label>Lokacija</label>
            <input
              value={f.lokacija}
              onChange={(e) => setF({ ...f, lokacija: e.target.value })}
              placeholder="Tokyo, Japan"
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Datum dolaska</label>
              <input
                type="date"
                value={f.dolazak}
                onChange={(e) => setF({ ...f, dolazak: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Datum odlaska</label>
              <input
                type="date"
                value={f.odlazak}
                onChange={(e) => setF({ ...f, odlazak: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Foto URL (opciono)</label>
            <input
              value={f.foto || ''}
              onChange={(e) => setF({ ...f, foto: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <div className="field">
            <label>Opis / napomene</label>
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

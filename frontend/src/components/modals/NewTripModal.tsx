import { useState } from 'react';
import type { FormEvent } from 'react';
import type { CreateTripRequest } from '../../dto/trip.dto';
import { Icon } from '../ui/Icon';

interface Props {
  onSave: (payload: CreateTripRequest) => Promise<void> | void;
  onCancel: () => void;
}

interface FormState {
  naziv: string;
  opis: string;
  pocetak: string;
  kraj: string;
  budzet: string;
  valuta: string;
  napomene: string;
  kover: string;
}

const initial: FormState = {
  naziv: '',
  opis: '',
  pocetak: '',
  kraj: '',
  budzet: '',
  valuta: 'EUR',
  napomene: '',
  kover: '',
};

export function NewTripModal({ onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.naziv.trim()) return setError('Naziv je obavezan.');
    if (!form.pocetak || !form.kraj) return setError('Datumi su obavezni.');
    if (new Date(form.kraj) < new Date(form.pocetak))
      return setError('Krajnji datum ne može biti pre početnog datuma.');
    const budzet = Number(form.budzet || 0);
    if (Number.isNaN(budzet) || budzet < 0)
      return setError('Budžet mora biti broj veći ili jednak nuli.');

    setSaving(true);
    try {
      await onSave({
        naziv: form.naziv.trim(),
        opis: form.opis.trim(),
        pocetak: form.pocetak,
        kraj: form.kraj,
        budzet,
        valuta: form.valuta,
        napomene: form.napomene.trim(),
        kover: form.kover.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška pri kreiranju.');
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--rule)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
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
              Novi plan
            </div>
            <h2
              className="serif"
              style={{
                fontSize: 28,
                margin: 0,
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              Kreirajte plan putovanja
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-sm btn-icon"
          >
            <Icon.close />
          </button>
        </div>

        <form
          onSubmit={submit}
          style={{
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div className="field">
            <label>Naziv putovanja</label>
            <input
              value={form.naziv}
              onChange={(e) => setForm({ ...form, naziv: e.target.value })}
              placeholder="npr. Vikend u Beču"
            />
          </div>

          <div className="field">
            <label>Kratak opis</label>
            <textarea
              value={form.opis}
              onChange={(e) => setForm({ ...form, opis: e.target.value })}
              placeholder="Šta planirate, ko ide, koja je tema putovanja..."
            />
          </div>

          <div className="row-2">
            <div className="field">
              <label>Početak</label>
              <input
                type="date"
                value={form.pocetak}
                onChange={(e) => setForm({ ...form, pocetak: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Kraj</label>
              <input
                type="date"
                value={form.kraj}
                onChange={(e) => setForm({ ...form, kraj: e.target.value })}
              />
            </div>
          </div>

          <div className="row-2">
            <div className="field">
              <label>Budžet</label>
              <input
                type="number"
                min={0}
                value={form.budzet}
                onChange={(e) => setForm({ ...form, budzet: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="field">
              <label>Valuta</label>
              <select
                value={form.valuta}
                onChange={(e) => setForm({ ...form, valuta: e.target.value })}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="RSD">RSD</option>
                <option value="BAM">BAM</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Cover URL (opciono)</label>
            <input
              value={form.kover}
              onChange={(e) => setForm({ ...form, kover: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div className="field">
            <label>Napomene</label>
            <textarea
              value={form.napomene}
              onChange={(e) => setForm({ ...form, napomene: e.target.value })}
              placeholder="Sve što treba zapamtiti pre puta."
            />
          </div>

          {error && (
            <div
              style={{
                color: 'var(--danger)',
                fontSize: 13,
                padding: '8px 12px',
                background: 'rgba(168,52,30,0.06)',
                border: '1px solid var(--danger)',
                borderRadius: 2,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onCancel}
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="btn btn-terra btn-sm"
              disabled={saving}
            >
              {saving ? 'Čuvanje...' : 'Kreiraj plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

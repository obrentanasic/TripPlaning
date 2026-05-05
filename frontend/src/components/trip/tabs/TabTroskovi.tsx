import { useState } from 'react';
import type { Trip, Trosak, KategorijaTroska } from '../../../models/Trip';
import { KATEGORIJE_TROSKOVA } from '../../../models/Trip';
import { fmtCurrency, fmtDateShort } from '../../../lib/format';
import { useService } from '../../../hooks/useService';
import { useToast } from '../../../context/ToastContext';
import { Icon } from '../../ui/Icon';
import { SectionHeader } from '../shared/SectionHeader';
import { ExpenseModal } from '../../modals/ExpenseModal';

interface Props {
  trip: Trip;
  canEdit: boolean;
  onUpdate: (t: Trip) => void;
}

type Filter = 'all' | KategorijaTroska;

const accentColors = {
  terra: 'var(--terra)',
  forest: 'var(--forest)',
  danger: 'var(--danger)',
} as const;

function BigStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: keyof typeof accentColors;
}) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        className="serif"
        style={{
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: accent ? accentColors[accent] : 'var(--ink)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function TabTroskovi({ trip, canEdit, onUpdate }: Props) {
  const tripsApi = useService('trips');
  const { show } = useToast();
  const [editing, setEditing] = useState<Partial<Trosak> | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState(false);

  const trosak = trip.troskovi.reduce((s, t) => s + t.iznos, 0);
  const ostalo = trip.budzet - trosak;
  const lista =
    filter === 'all'
      ? trip.troskovi
      : trip.troskovi.filter((t) => t.kategorija === filter);

  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await tripsApi.removeExpense(trip.id, id);
      onUpdate({ ...trip, troskovi: trip.troskovi.filter((t) => t.id !== id) });
      show('Trošak obrisan');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Greška pri brisanju.');
    } finally {
      setBusy(false);
    }
  };

  const save = async (t: Trosak | (Omit<Trosak, 'id'> & { id?: string })) => {
    if (busy) return;
    setBusy(true);
    try {
      if (t.id) {
        const saved = await tripsApi.updateExpense(trip.id, t as Trosak);
        onUpdate({
          ...trip,
          troskovi: trip.troskovi.map((x) => (x.id === saved.id ? saved : x)),
        });
        show('Trošak sačuvan');
      } else {
        const { id: _drop, ...payload } = t as Trosak;
        void _drop;
        const saved = await tripsApi.addExpense(trip.id, payload);
        onUpdate({ ...trip, troskovi: [...trip.troskovi, saved] });
        show('Trošak dodan');
      }
      setEditing(null);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Greška pri čuvanju.');
    } finally {
      setBusy(false);
    }
  };

  const kategPotrosnja = KATEGORIJE_TROSKOVA.map((k) => ({
    ...k,
    iznos: trip.troskovi
      .filter((t) => t.kategorija === k.id)
      .reduce((s, t) => s + t.iznos, 0),
    count: trip.troskovi.filter((t) => t.kategorija === k.id).length,
  }));
  const max = Math.max(...kategPotrosnja.map((k) => k.iznos), 1);

  return (
    <div>
      <SectionHeader title="Troškovi i budžet" count={trip.troskovi.length} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          margin: '20px 0',
        }}
      >
        <BigStat label="Planirani budžet" value={fmtCurrency(trip.budzet, trip.valuta)} />
        <BigStat
          label="Potrošeno"
          value={fmtCurrency(trosak, trip.valuta)}
          accent="terra"
        />
        <BigStat
          label="Preostalo"
          value={fmtCurrency(ostalo, trip.valuta)}
          accent={ostalo < 0 ? 'danger' : 'forest'}
        />
      </div>

      {/* Category breakdown */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 16,
          }}
        >
          Po kategoriji
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {kategPotrosnja.map((k) => (
            <div key={k.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: k.boja,
                    }}
                  />
                  {k.naziv}{' '}
                  <span
                    className="mono"
                    style={{ color: 'var(--ink-3)', fontSize: 11 }}
                  >
                    · {k.count} stavki
                  </span>
                </span>
                <span className="mono">{fmtCurrency(k.iznos, trip.valuta)}</span>
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
                    width: `${(k.iznos / max) * 100}%`,
                    height: '100%',
                    background: k.boja,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar + list */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
        }}
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          style={{ width: 220 }}
        >
          <option value="all">Sve kategorije</option>
          {KATEGORIJE_TROSKOVA.map((k) => (
            <option key={k.id} value={k.id}>
              {k.naziv}
            </option>
          ))}
        </select>
        {canEdit && (
          <button
            className="btn btn-terra btn-sm"
            onClick={() => setEditing({})}
          >
            <Icon.plus /> Novi trošak
          </button>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 160px 120px auto',
            gap: 16,
            padding: '12px 20px',
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--rule)',
          }}
        >
          {['Datum', 'Naziv / opis', 'Kategorija', 'Iznos', ''].map((h, i) => (
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
        {lista.map((t) => {
          const k = KATEGORIJE_TROSKOVA.find((x) => x.id === t.kategorija);
          return (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 160px 120px auto',
                gap: 16,
                padding: '14px 20px',
                borderBottom: '1px solid var(--rule)',
                alignItems: 'center',
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 12, color: 'var(--ink-3)' }}
              >
                {fmtDateShort(t.datum)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{t.naziv}</div>
                {t.opis && (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--ink-3)',
                      marginTop: 2,
                    }}
                  >
                    {t.opis}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: k?.boja || '#999',
                  }}
                />
                {k?.naziv || t.kategorija}
              </div>
              <div
                className="mono"
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                {fmtCurrency(t.iznos, trip.valuta)}
              </div>
              {canEdit ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => setEditing(t)}
                  >
                    <Icon.edit />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => remove(t.id)}
                  >
                    <Icon.trash />
                  </button>
                </div>
              ) : (
                <div />
              )}
            </div>
          );
        })}
        {lista.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--ink-3)',
              fontSize: 13,
            }}
          >
            Nema troškova u izabranoj kategoriji.
          </div>
        )}
      </div>

      {editing !== null && (
        <ExpenseModal
          expense={editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

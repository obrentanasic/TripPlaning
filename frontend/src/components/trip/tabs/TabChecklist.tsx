import { useState } from 'react';
import type {
  Trip,
  KategorijaChecklist,
} from '../../../models/Trip';
import { KATEGORIJE_CHECKLIST } from '../../../models/Trip';
import { uid } from '../../../lib/format';
import { Icon } from '../../ui/Icon';
import { SectionHeader } from '../shared/SectionHeader';

interface Props {
  trip: Trip;
  canEdit: boolean;
  onUpdate: (t: Trip) => void;
}

interface NewState {
  naziv: string;
  kategorija: KategorijaChecklist;
}

export function TabChecklist({ trip, canEdit, onUpdate }: Props) {
  const [novi, setNovi] = useState<NewState>({
    naziv: '',
    kategorija: 'dokumenti',
  });

  const toggle = (id: string) =>
    onUpdate({
      ...trip,
      checklist: trip.checklist.map((c) =>
        c.id === id ? { ...c, zavrseno: !c.zavrseno } : c
      ),
    });

  const remove = (id: string) =>
    onUpdate({
      ...trip,
      checklist: trip.checklist.filter((c) => c.id !== id),
    });

  const add = () => {
    if (!novi.naziv.trim()) return;
    onUpdate({
      ...trip,
      checklist: [
        ...trip.checklist,
        { id: uid(), naziv: novi.naziv.trim(), kategorija: novi.kategorija, zavrseno: false },
      ],
    });
    setNovi({ naziv: '', kategorija: novi.kategorija });
  };

  const grupisano = KATEGORIJE_CHECKLIST.map((k) => ({
    ...k,
    items: trip.checklist.filter((c) => c.kategorija === k.id),
  }));

  const ukupno = trip.checklist.length;
  const zavrseno = trip.checklist.filter((c) => c.zavrseno).length;
  const proc = ukupno ? Math.round((zavrseno / ukupno) * 100) : 0;

  return (
    <div>
      <SectionHeader title="Lista pakovanja" count={trip.checklist.length} />

      <div
        style={{
          margin: '20px 0',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
            }}
          >
            <div className="serif" style={{ fontSize: 32 }}>
              {zavrseno}{' '}
              <span style={{ color: 'var(--ink-3)' }}>od {ukupno} stavki</span>
            </div>
            <div className="mono" style={{ fontSize: 14, color: 'var(--forest)' }}>
              {proc}%
            </div>
          </div>
          <div
            style={{
              height: 8,
              background: 'var(--bg-2)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${proc}%`,
                height: '100%',
                background: 'var(--forest)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        {canEdit && (
          <div className="card" style={{ padding: 20 }}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 10,
              }}
            >
              Brzo dodavanje
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={novi.naziv}
                onChange={(e) => setNovi({ ...novi, naziv: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && add()}
                placeholder="Stavka..."
              />
              <select
                value={novi.kategorija}
                onChange={(e) =>
                  setNovi({
                    ...novi,
                    kategorija: e.target.value as KategorijaChecklist,
                  })
                }
                style={{ width: 140 }}
              >
                {KATEGORIJE_CHECKLIST.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.naziv}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-sm"
                onClick={add}
                aria-label="Dodaj stavku"
              >
                <Icon.plus />
              </button>
            </div>
          </div>
        )}
      </div>

      {ukupno === 0 ? (
        <div
          style={{
            padding: '48px 16px',
            border: '1.5px dashed var(--rule-2)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--ink-3)',
          }}
        >
          Nema stavki na listi pakovanja. {canEdit ? 'Dodajte prvu putem brzog dodavanja iznad.' : ''}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {grupisano
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <div key={g.id} className="card" style={{ padding: 20 }}>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                    marginBottom: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{g.naziv}</span>
                  <span>
                    {g.items.filter((i) => i.zavrseno).length}/{g.items.length}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {g.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 2,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--bg-2)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <div
                        className={`check ${item.zavrseno ? 'checked' : ''}`}
                        onClick={() => canEdit && toggle(item.id)}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          color: item.zavrseno ? 'var(--ink-3)' : 'var(--ink)',
                          textDecoration: item.zavrseno
                            ? 'line-through'
                            : 'none',
                        }}
                      >
                        {item.naziv}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => remove(item.id)}
                          style={{
                            background: 'none',
                            border: 0,
                            color: 'var(--ink-3)',
                            cursor: 'pointer',
                            padding: 4,
                            opacity: 0.5,
                          }}
                          aria-label="Obriši"
                        >
                          <Icon.close />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

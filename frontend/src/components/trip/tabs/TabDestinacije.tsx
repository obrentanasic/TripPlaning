import { useState } from 'react';
import type { Destinacija, Trip } from '../../../models/Trip';
import { daysBetween, fmtDateShort, uid } from '../../../lib/format';
import { Icon } from '../../ui/Icon';
import { SectionHeader } from '../shared/SectionHeader';
import { DestinationModal } from '../../modals/DestinationModal';

interface Props {
  trip: Trip;
  canEdit: boolean;
  onUpdate: (t: Trip) => void;
}

export function TabDestinacije({ trip, canEdit, onUpdate }: Props) {
  const [editing, setEditing] = useState<Partial<Destinacija> | null>(null);

  const remove = (id: string) => {
    onUpdate({
      ...trip,
      destinacije: trip.destinacije.filter((d) => d.id !== id),
      aktivnosti: trip.aktivnosti.filter((a) => a.destId !== id),
    });
  };

  const save = (d: Destinacija | (Omit<Destinacija, 'id'> & { id?: string })) => {
    if (d.id) {
      onUpdate({
        ...trip,
        destinacije: trip.destinacije.map((x) => (x.id === d.id ? (d as Destinacija) : x)),
      });
    } else {
      onUpdate({
        ...trip,
        destinacije: [...trip.destinacije, { ...(d as Destinacija), id: uid() }],
      });
    }
    setEditing(null);
  };

  return (
    <div>
      <SectionHeader title="Destinacije" count={trip.destinacije.length} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '20px 0',
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: 'var(--ink-2)',
            maxWidth: 600,
          }}
        >
          Mjesta koja planirate posjetiti tokom ovog putovanja, sa pripadajućim datumima i napomenama.
        </div>
        {canEdit && (
          <button
            className="btn btn-terra btn-sm"
            onClick={() => setEditing({})}
          >
            <Icon.plus /> Dodaj destinaciju
          </button>
        )}
      </div>

      {trip.destinacije.length === 0 ? (
        <div
          style={{
            padding: '48px 16px',
            border: '1.5px dashed var(--rule-2)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--ink-3)',
          }}
        >
          Nema destinacija. {canEdit ? 'Dodajte prvu klikom na dugme iznad.' : ''}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'var(--rule)',
          }}
        >
          {trip.destinacije.map((d, i) => (
            <div
              key={d.id}
              style={{
                background: 'var(--paper)',
                display: 'grid',
                gridTemplateColumns: '120px 220px 1fr 200px auto',
                gap: 24,
                padding: 20,
                alignItems: 'center',
              }}
            >
              <div
                className="serif"
                style={{ fontSize: 56, lineHeight: 1, color: 'var(--terra)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>
                  {d.naziv}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--ink-3)',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon.pin /> {d.lokacija}
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--ink-2)',
                  lineHeight: 1.5,
                }}
              >
                {d.opis || (
                  <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>
                    nema opisa
                  </span>
                )}
              </div>
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                  }}
                >
                  Boravak
                </div>
                <div style={{ fontSize: 13, marginTop: 2 }}>
                  {fmtDateShort(d.dolazak)} → {fmtDateShort(d.odlazak)}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}
                >
                  {daysBetween(d.dolazak, d.odlazak)} noći
                </div>
              </div>
              {canEdit && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => setEditing(d)}
                  >
                    <Icon.edit />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => remove(d.id)}
                  >
                    <Icon.trash />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <DestinationModal
          dest={editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

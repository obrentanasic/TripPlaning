import { useState } from 'react';
import type { Aktivnost, Trip } from '../../../models/Trip';
import { eachDay, fmtCurrency, fmtDateShort, fmtDay, uid } from '../../../lib/format';
import { Icon } from '../../ui/Icon';
import { SectionHeader } from '../shared/SectionHeader';
import { StatusPill } from '../shared/StatusPill';
import { ActivityModal } from '../../modals/ActivityModal';

interface Props {
  trip: Trip;
  canEdit: boolean;
  onUpdate: (t: Trip) => void;
}

type View = 'lista' | 'kalendar';

export function TabDani({ trip, canEdit, onUpdate }: Props) {
  const [view, setView] = useState<View>('lista');
  const [editing, setEditing] = useState<Partial<Aktivnost> | null>(null);

  const days = eachDay(trip.pocetak, trip.kraj);

  const remove = (id: string) =>
    onUpdate({
      ...trip,
      aktivnosti: trip.aktivnosti.filter((a) => a.id !== id),
    });

  const save = (a: Aktivnost | (Omit<Aktivnost, 'id'> & { id?: string })) => {
    if (a.id) {
      onUpdate({
        ...trip,
        aktivnosti: trip.aktivnosti.map((x) =>
          x.id === a.id ? (a as Aktivnost) : x
        ),
      });
    } else {
      onUpdate({
        ...trip,
        aktivnosti: [...trip.aktivnosti, { ...(a as Aktivnost), id: uid() }],
      });
    }
    setEditing(null);
  };

  return (
    <div>
      <SectionHeader title="Dnevni raspored" count={trip.aktivnosti.length} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '20px 0',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 0,
            border: '1px solid var(--rule)',
            borderRadius: 2,
            background: 'var(--paper)',
          }}
        >
          {(
            [
              { id: 'lista', label: 'Lista' },
              { id: 'kalendar', label: 'Kalendar' },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: '8px 16px',
                border: 0,
                background: view === v.id ? 'var(--ink)' : 'transparent',
                color: view === v.id ? 'var(--paper)' : 'var(--ink-2)',
                fontSize: 13,
                fontFamily: 'inherit',
                borderRadius: 0,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        {canEdit && (
          <button
            className="btn btn-terra btn-sm"
            onClick={() => setEditing({})}
          >
            <Icon.plus /> Nova aktivnost
          </button>
        )}
      </div>

      {view === 'lista' ? (
        <ListaView
          trip={trip}
          days={days}
          canEdit={canEdit}
          onEdit={setEditing}
          onDelete={remove}
        />
      ) : (
        <CalendarView
          trip={trip}
          days={days}
          canEdit={canEdit}
          onClick={(date, activity) => {
            if (!canEdit) return;
            setEditing(activity ?? { datum: date });
          }}
        />
      )}

      {editing !== null && (
        <ActivityModal
          activity={editing}
          days={days}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ListaView({
  trip,
  days,
  canEdit,
  onEdit,
  onDelete,
}: {
  trip: Trip;
  days: string[];
  canEdit: boolean;
  onEdit: (a: Aktivnost) => void;
  onDelete: (id: string) => void;
}) {
  const grupisane = days.map((d) => ({
    date: d,
    items: trip.aktivnosti
      .filter((a) => a.datum === d)
      .sort((a, b) => a.vrijeme.localeCompare(b.vrijeme)),
  }));

  if (days.length === 0) {
    return (
      <div
        style={{
          padding: '40px 16px',
          textAlign: 'center',
          color: 'var(--ink-3)',
        }}
      >
        Nema definisanih datuma za putovanje.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {grupisane.map((g) => (
        <div key={g.date}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid var(--rule)',
            }}
          >
            <div
              className="serif"
              style={{
                fontSize: 32,
                lineHeight: 1,
                minWidth: 110,
                letterSpacing: 0,
              }}
            >
              {fmtDateShort(g.date)}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                whiteSpace: 'nowrap',
              }}
            >
              {fmtDay(g.date)}
            </div>
            <div style={{ flex: 1 }} />
            <span
              className="mono"
              style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                whiteSpace: 'nowrap',
              }}
            >
              {g.items.length} aktivn.
            </span>
          </div>
          {g.items.length === 0 ? (
            <div
              style={{
                padding: 16,
                fontSize: 13,
                color: 'var(--ink-3)',
                fontStyle: 'italic',
              }}
            >
              Nema aktivnosti za ovaj dan.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {g.items.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  canEdit={canEdit}
                  onEdit={() => onEdit(a)}
                  onDelete={() => onDelete(a.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ActivityCard({
  activity,
  canEdit,
  onEdit,
  onDelete,
}: {
  activity: Aktivnost;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="card"
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr auto auto',
        gap: 16,
        padding: 16,
        alignItems: 'center',
      }}
    >
      <div style={{ borderRight: '1px solid var(--rule)', paddingRight: 16 }}>
        <div className="serif" style={{ fontSize: 24, lineHeight: 1 }}>
          {activity.vrijeme}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{activity.naziv}</div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            fontSize: 12,
            color: 'var(--ink-3)',
            marginTop: 4,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon.pin /> {activity.lokacija}
          </span>
          {activity.opis && <span>· {activity.opis}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {activity.trosak > 0 && (
          <span
            className="mono"
            style={{ fontSize: 13, color: 'var(--ink)' }}
          >
            {fmtCurrency(activity.trosak)}
          </span>
        )}
        <StatusPill status={activity.status} />
      </div>
      {canEdit ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={onEdit}
            aria-label="Izmijeni"
          >
            <Icon.edit />
          </button>
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={onDelete}
            aria-label="Obriši"
          >
            <Icon.trash />
          </button>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}

const WEEKDAYS = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'];

function CalendarView({
  trip,
  days,
  onClick,
}: {
  trip: Trip;
  days: string[];
  canEdit: boolean;
  onClick: (date: string, activity: Aktivnost | null) => void;
}) {
  if (days.length === 0)
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: 'var(--ink-3)',
        }}
      >
        Nema definisanih datuma.
      </div>
    );

  const start = new Date(days[0]);
  const dayOfWeek = (start.getDay() + 6) % 7; // 0=Mon
  const cells: (string | null)[] = [];
  for (let i = 0; i < dayOfWeek; i++) cells.push(null);
  days.forEach((d) => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="card">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="mono"
            style={{
              padding: '12px 16px',
              fontSize: 10,
              letterSpacing: '0.16em',
              color: 'var(--ink-3)',
              textAlign: 'center',
            }}
          >
            {w}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (!d)
            return (
              <div
                key={i}
                style={{
                  minHeight: 140,
                  background: 'var(--bg-2)',
                  borderRight: i % 7 < 6 ? '1px solid var(--rule)' : 0,
                  borderTop: i >= 7 ? '1px solid var(--rule)' : 0,
                }}
              />
            );
          const items = trip.aktivnosti
            .filter((a) => a.datum === d)
            .sort((a, b) => a.vrijeme.localeCompare(b.vrijeme));
          const dayNum = new Date(d).getDate();
          return (
            <div
              key={i}
              style={{
                minHeight: 140,
                padding: 8,
                borderRight: i % 7 < 6 ? '1px solid var(--rule)' : 0,
                borderTop: i >= 7 ? '1px solid var(--rule)' : 0,
                cursor: 'pointer',
              }}
              onClick={() => onClick(d, null)}
            >
              <div className="serif" style={{ fontSize: 18, color: 'var(--ink-2)' }}>
                {dayNum}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  marginTop: 6,
                }}
              >
                {items.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(d, a);
                    }}
                    style={{
                      padding: '3px 6px',
                      background:
                        a.status === 'rezervisano' ? 'var(--terra)' : 'var(--ink)',
                      color: 'var(--paper)',
                      fontSize: 10,
                      borderRadius: 1,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span className="mono" style={{ opacity: 0.7 }}>
                      {a.vrijeme}
                    </span>{' '}
                    {a.naziv}
                  </div>
                ))}
                {items.length > 4 && (
                  <div
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: 'var(--ink-3)',
                      paddingLeft: 4,
                    }}
                  >
                    +{items.length - 4} više
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import type { Trip } from '../../models/Trip';
import type { User } from '../../models/User';
import { fmtCurrency } from '../../lib/format';
import { Icon } from '../ui/Icon';
import { StatsStrip } from './StatsStrip';
import { TripCard } from './TripCard';

interface Props {
  trips: Trip[];
  user: User;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

type Filter = 'all' | 'upcoming' | 'past';

export function Dashboard({ trips, user, onOpen, onCreate, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const today = new Date().toISOString().split('T')[0];
  const filtered = useMemo(
    () =>
      trips.filter((t) => {
        if (search && !t.naziv.toLowerCase().includes(search.toLowerCase()))
          return false;
        if (filter === 'upcoming' && t.kraj < today) return false;
        if (filter === 'past' && t.kraj >= today) return false;
        return true;
      }),
    [trips, search, filter, today]
  );

  const totalBudget = trips.reduce((s, t) => s + (t.budzet || 0), 0);
  const totalSpent = trips.reduce(
    (s, t) => s + t.troskovi.reduce((a, b) => a + b.iznos, 0),
    0
  );
  const upcoming = trips.filter((t) => t.kraj >= today).length;
  const totalDestinations = trips.reduce((s, t) => s + t.destinacije.length, 0);
  const usedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div style={{ padding: '40px 32px 80px', maxWidth: 1400, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 8,
          gap: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 12,
            }}
          >
            ↳ Dobrodošli, {user.ime.split(' ')[0]}
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 72,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Vaši <em>planovi</em>
            <br />
            putovanja.
          </h1>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
          }}
        >
          <button className="btn btn-terra" onClick={onCreate}>
            <Icon.plus /> Novi plan putovanja
          </button>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
            }}
          >
            {new Date().toLocaleDateString('sr-Latn', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>

      <hr className="divider" style={{ margin: '32px 0' }} />

      <StatsStrip
        stats={[
          {
            label: 'Planova ukupno',
            value: trips.length,
            sub: `${upcoming} predstojećih`,
          },
          {
            label: 'Destinacija',
            value: totalDestinations,
            sub: 'kroz sve planove',
          },
          {
            label: 'Ukupan budžet',
            value: fmtCurrency(totalBudget),
            sub: 'planirano',
          },
          {
            label: 'Potrošeno',
            value: fmtCurrency(totalSpent),
            sub: totalBudget > 0 ? `${usedPct}% iskorišćeno` : '—',
          },
        ]}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Icon.search
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-3)',
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretražite planove..."
            style={{ paddingLeft: 36 }}
          />
        </div>
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
              { id: 'all', label: 'Sve' },
              { id: 'upcoming', label: 'Predstojeće' },
              { id: 'past', label: 'Završeno' },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '9px 16px',
                border: 0,
                background: filter === f.id ? 'var(--ink)' : 'transparent',
                color: filter === f.id ? 'var(--paper)' : 'var(--ink-2)',
                fontSize: 13,
                fontFamily: 'inherit',
                borderRadius: 0,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {filtered.length} {filtered.length === 1 ? 'plan' : 'planova'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 24,
        }}
      >
        {filtered.map((t, idx) => (
          <TripCard
            key={t.id}
            trip={t}
            index={idx}
            onOpen={() => onOpen(t.id)}
            onDelete={() => onDelete(t.id)}
          />
        ))}
        <NewTripSlot onClick={onCreate} />
      </div>
    </div>
  );
}

function NewTripSlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: '1.5px dashed var(--rule-2)',
        borderRadius: 2,
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--ink-3)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--ink)';
        e.currentTarget.style.color = 'var(--ink)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--rule-2)';
        e.currentTarget.style.color = 'var(--ink-3)';
      }}
    >
      <Icon.plus style={{ width: 24, height: 24 }} />
      <div className="serif" style={{ fontSize: 22 }}>
        Novo putovanje
      </div>
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}
      >
        Započnite plan
      </div>
    </button>
  );
}

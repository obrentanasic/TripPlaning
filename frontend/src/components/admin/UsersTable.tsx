import { useMemo, useState } from 'react';
import type { User } from '../../models/User';
import { fmtDate } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface Props {
  users: User[];
  currentUserId: string;
  busyId: string | null;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTable({
  users,
  currentUserId,
  busyId,
  onToggleStatus,
  onDelete,
}: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'aktivan' | 'suspendovan'>('all');

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (filter !== 'all' && u.status !== filter) return false;
        if (
          search &&
          !u.ime.toLowerCase().includes(search.toLowerCase()) &&
          !u.email.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [users, search, filter]
  );

  return (
    <div>
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
            placeholder="Pretražite korisnike..."
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
              { id: 'all' as const, label: 'Svi' },
              { id: 'aktivan' as const, label: 'Aktivni' },
              { id: 'suspendovan' as const, label: 'Suspendovani' },
            ]
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
          {filtered.length} korisnika
        </span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 2fr 100px 140px 140px 200px',
            gap: 16,
            padding: '12px 20px',
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--rule)',
          }}
        >
          {['Ime', 'Email', 'Uloga', 'Registrovan', 'Status', ''].map((h, i) => (
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
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--ink-3)',
              fontSize: 13,
            }}
          >
            Nema korisnika u ovom filteru.
          </div>
        ) : (
          filtered.map((u) => {
            const initials = u.ime
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2);
            const isSelf = u.id === currentUserId;
            const busy = busyId === u.id;
            return (
              <div
                key={u.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 2fr 100px 140px 140px 200px',
                  gap: 16,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--rule)',
                  alignItems: 'center',
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}
                >
                  <div
                    className="avatar"
                    style={{
                      background:
                        u.uloga === 'admin' ? 'var(--terra)' : 'var(--forest)',
                      width: 30,
                      height: 30,
                      fontSize: 12,
                    }}
                  >
                    {initials}
                  </div>
                  <span style={{ fontSize: 14 }}>{u.ime}</span>
                  {isSelf && (
                    <span
                      className="chip mono"
                      style={{ fontSize: 9, padding: '2px 6px' }}
                    >
                      VI
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--ink-2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.email}
                </span>
                <span
                  className={`chip mono ${u.uloga === 'admin' ? 'chip-terra' : ''}`}
                  style={{ fontSize: 9, justifySelf: 'start' }}
                >
                  {u.uloga.toUpperCase()}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}
                >
                  {fmtDate(u.registrovanDana)}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color:
                      u.status === 'suspendovan' ? 'var(--danger)' : 'var(--forest)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.status}
                </span>
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onToggleStatus(u)}
                    disabled={isSelf || busy}
                    style={{
                      opacity: isSelf || busy ? 0.4 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {u.status === 'aktivan' ? 'Suspenduj' : 'Aktiviraj'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => onDelete(u)}
                    disabled={isSelf || busy}
                    style={{
                      opacity: isSelf || busy ? 0.4 : 1,
                      color: 'var(--danger)',
                    }}
                    aria-label="Obriši"
                  >
                    <Icon.trash />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

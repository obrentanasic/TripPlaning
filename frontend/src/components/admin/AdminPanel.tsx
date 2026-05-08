import { useEffect, useMemo, useState } from 'react';
import type { User } from '../../models/User';
import type { AdminTripDto } from '../../dto/admin.dto';
import { fmtCurrency } from '../../lib/format';
import { useService } from '../../hooks/useService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../ui/Icon';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { UsersTable } from './UsersTable';
import { AllTripsTable } from './AllTripsTable';
import { ServicesStatus } from './ServicesStatus';

interface Props {
  onBack: () => void;
}

type Tab = 'korisnici' | 'planovi' | 'sistem';

export function AdminPanel({ onBack }: Props) {
  const adminApi = useService('admin');
  const { user } = useAuth();
  const { show } = useToast();

  const [tab, setTab] = useState<Tab>('korisnici');
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<AdminTripDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([adminApi.listUsers(), adminApi.listAllTrips()])
      .then(([u, t]) => {
        if (!cancelled) {
          setUsers(u);
          setTrips(t);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Greška.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adminApi]);

  const stats = useMemo(() => {
    const aktivni = users.filter((u) => u.status === 'aktivan').length;
    const totalBudget = trips.reduce((s, t) => s + t.budzet, 0);
    return {
      korisnika: users.length,
      aktivni,
      planova: trips.length,
      budzet: totalBudget,
    };
  }, [users, trips]);

  const toggleStatus = async (u: User) => {
    setBusyId(u.id);
    try {
      const next = u.status === 'aktivan' ? 'suspendovan' : 'aktivan';
      const updated = await adminApi.setUserStatus(u.id, next);
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      show(
        updated.status === 'aktivan'
          ? `${updated.ime} je aktiviran.`
          : `${updated.ime} je suspendovan.`
      );
    } catch (err) {
      show(err instanceof Error ? err.message : 'Greška.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (u: User) => {
    setBusyId(u.id);
    try {
      await adminApi.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      show(`${u.ime} je obrisan.`);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Greška pri brisanju.');
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }} className="fade-in">
      {/* Hero */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 24,
          gap: 24,
        }}
      >
        <div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
              marginBottom: 12,
            }}
          >
            ↳ Admin / Sistem
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Administracija.
          </h1>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
            <Icon.arrow />
          </span>{' '}
          Nazad
        </button>
      </div>

      {/* Stats strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          margin: '32px 0',
          border: '1px solid var(--rule)',
          background: 'var(--paper)',
        }}
      >
        {[
          { l: 'Korisnici', v: stats.korisnika, s: `${stats.aktivni} aktivnih` },
          { l: 'Planovi putovanja', v: stats.planova, s: 'u sistemu' },
          { l: 'Ukupan budžet', v: fmtCurrency(stats.budzet), s: 'kroz sve planove' },
          { l: 'Vaša uloga', v: user?.uloga ?? '—', s: user?.email ?? '' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: '20px 24px',
              borderRight: i < 3 ? '1px solid var(--rule)' : 0,
            }}
          >
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
              {s.l}
            </div>
            <div className="serif" style={{ fontSize: 32, lineHeight: 1 }}>
              {s.v}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
              {s.s}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--rule)',
          marginBottom: 20,
        }}
      >
        {(
          [
            { id: 'korisnici' as const, label: 'Korisnici', count: users.length },
            { id: 'planovi' as const, label: 'Svi planovi', count: trips.length },
            { id: 'sistem' as const, label: 'Sistem & servisi' },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'transparent',
              border: 0,
              padding: '12px 16px',
              fontSize: 14,
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: tab === t.id ? 500 : 400,
              borderBottom:
                tab === t.id ? '2px solid var(--terra)' : '2px solid transparent',
              marginBottom: -1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: 'var(--ink-3)',
                  background: 'var(--bg-2)',
                  padding: '1px 6px',
                  borderRadius: 999,
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: 16,
            background: 'rgba(168,52,30,0.06)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: 64,
            textAlign: 'center',
            color: 'var(--ink-3)',
            fontSize: 13,
          }}
          className="mono"
        >
          UČITAVANJE…
        </div>
      ) : (
        <>
          {tab === 'korisnici' && (
            <UsersTable
              users={users}
              currentUserId={user?.id ?? ''}
              busyId={busyId}
              onToggleStatus={toggleStatus}
              onDelete={(u) => setConfirmDelete(u)}
            />
          )}
          {tab === 'planovi' && <AllTripsTable trips={trips} users={users} />}
          {tab === 'sistem' && <ServicesStatus />}
        </>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Obrisati ${confirmDelete.ime}?`}
          body="Korisnik će biti trajno obrisan iz sistema. Njegovi planovi ostaju u bazi (osiroteli — UserId više neće odgovarati nalogu)."
          confirmLabel="Obriši"
          onConfirm={() => deleteUser(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

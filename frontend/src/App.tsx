import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { TopNav, type TopView } from './components/layout/TopNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { NewTripModal } from './components/modals/NewTripModal';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { useService } from './hooks/useService';
import type { Trip } from './models/Trip';
import type { CreateTripRequest } from './dto/trip.dto';

function Shell() {
  const { user } = useAuth();
  const { show } = useToast();
  const tripsApi = useService('trips');

  const [view, setView] = useState<TopView>('dashboard');
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const [showNewTrip, setShowNewTrip] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    tripsApi
      .list()
      .then(setTrips)
      .finally(() => setLoading(false));
  }, [user, tripsApi]);

  if (!user) return <AuthScreen />;

  const create = async (payload: CreateTripRequest) => {
    const trip = await tripsApi.create(payload);
    setTrips((prev) => [trip, ...prev]);
    setShowNewTrip(false);
    setOpenTripId(trip.id);
    setView('trip');
    show('Plan kreiran');
  };

  const remove = async (id: string) => {
    await tripsApi.remove(id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
    setConfirmDelete(null);
    show('Plan obrisan');
  };

  const open = (id: string) => {
    setOpenTripId(id);
    setView('trip');
    window.scrollTo(0, 0);
  };

  const navigate = (next: 'dashboard' | 'admin') => {
    setView(next);
    if (next === 'dashboard') setOpenTripId(null);
  };

  return (
    <div className="app">
      <TopNav view={view} onNavigate={navigate} />

      {view === 'dashboard' &&
        (loading ? (
          <main
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 64,
            }}
          >
            <div className="mono" style={{ color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11 }}>
              Učitavanje planova...
            </div>
          </main>
        ) : (
          <Dashboard
            trips={trips}
            user={user}
            onOpen={open}
            onCreate={() => setShowNewTrip(true)}
            onDelete={(id) => setConfirmDelete(id)}
          />
        ))}

      {view === 'trip' && openTripId && (
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 64,
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
            }}
          >
            Trip detail — Checkpoint 4
          </div>
          <div className="serif" style={{ fontSize: 32 }}>
            {trips.find((t) => t.id === openTripId)?.naziv}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('dashboard')}
          >
            ← Nazad na planove
          </button>
        </main>
      )}

      {view === 'admin' && (
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 64,
          }}
        >
          <div className="mono" style={{ color: 'var(--ink-3)' }}>
            Admin panel — Checkpoint 12
          </div>
        </main>
      )}

      {showNewTrip && (
        <NewTripModal onSave={create} onCancel={() => setShowNewTrip(false)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Obrisati plan?"
          body="Ova akcija je trajna i obrisaće sve povezane destinacije, aktivnosti, troškove i checklist stavke."
          onConfirm={() => remove(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AuthProvider>
  );
}

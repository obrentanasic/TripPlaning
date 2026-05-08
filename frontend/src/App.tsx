import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { TopNav, type TopView } from './components/layout/TopNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { TripDetail } from './components/trip/TripDetail';
import { NewTripModal } from './components/modals/NewTripModal';
import { ConfirmDialog } from './components/modals/ConfirmDialog';
import { ShareModal } from './components/modals/ShareModal';
import { PdfPreview } from './components/modals/PdfPreview';
import { AdminPanel } from './components/admin/AdminPanel';
import type { SaradnikUloga } from './models/Trip';
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
  const [showShare, setShowShare] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

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
    try {
      await tripsApi.remove(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      setConfirmDelete(null);
      show('Plan obrisan');
    } catch (err) {
      setConfirmDelete(null);
      show(err instanceof Error ? err.message : 'Greška pri brisanju');
    }
  };

  // Local-only patch: tabs run their own HTTP calls and then call this
  // to refresh App-level state without a second round-trip.
  const patchTrip = (next: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  };

  const addCollaborator = (collab: { ime: string; email: string; uloga: SaradnikUloga }) => {
    const openTrip = trips.find((t) => t.id === openTripId);
    if (!openTrip) return;
    if (openTrip.saradnici.some((s) => s.email === collab.email)) {
      show('Saradnik je već dodan.');
      return;
    }
    // Collaborators are persisted server-side in Checkpoint 11 (sharing).
    // Keep them in client state so the UI feedback stays correct.
    patchTrip({ ...openTrip, saradnici: [...openTrip.saradnici, collab] });
    show('Saradnik dodan');
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

      {view === 'trip' &&
        openTripId &&
        (() => {
          const openTrip = trips.find((t) => t.id === openTripId);
          if (!openTrip) {
            return (
              <main style={{ padding: 64, textAlign: 'center' }}>
                <div className="mono" style={{ color: 'var(--ink-3)' }}>
                  Plan nije pronađen.
                </div>
              </main>
            );
          }
          return (
            <TripDetail
              trip={openTrip}
              onBack={() => navigate('dashboard')}
              onShare={() => setShowShare(true)}
              onPdfExport={() => setShowPdf(true)}
              onUpdate={patchTrip}
            />
          );
        })()}

      {view === 'admin' && user.uloga === 'admin' && (
        <AdminPanel onBack={() => navigate('dashboard')} />
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
      {showShare &&
        openTripId &&
        (() => {
          const openTrip = trips.find((t) => t.id === openTripId);
          if (!openTrip) return null;
          return (
            <ShareModal
              trip={openTrip}
              onClose={() => setShowShare(false)}
              onAddCollab={addCollaborator}
            />
          );
        })()}
      {showPdf &&
        openTripId &&
        (() => {
          const openTrip = trips.find((t) => t.id === openTripId);
          if (!openTrip) return null;
          return <PdfPreview trip={openTrip} onClose={() => setShowPdf(false)} />;
        })()}
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

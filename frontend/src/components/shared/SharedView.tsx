import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ServicesProvider, useService } from '../../hooks/useService';
import { ToastProvider, useToast } from '../../context/ToastContext';
import { TripDetail } from '../trip/TripDetail';
import { HttpTripsService } from '../../services/http-trips.service';
import { HttpShareService } from '../../services/share.service';
import { HttpAuthService } from '../../services/auth.service';
import { HttpAdminService } from '../../services/admin.service';
import { HttpStatusService } from '../../services/status.service';
import { http } from '../../services/http';
import type { Services } from '../../services';
import type { Trip } from '../../models/Trip';
import { Icon } from '../ui/Icon';

interface Props {
  token: string;
}

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/api';

export function SharedView({ token }: Props) {
  const sharedHttp = useMemo(() => {
    const inst = axios.create({
      baseURL: apiBase,
      headers: {
        'Content-Type': 'application/json',
        'X-Share-Token': token,
      },
    });
    return inst;
  }, [token]);

  const sharedServices = useMemo<Services>(() => ({
    auth: new HttpAuthService(http),
    trips: new HttpTripsService(sharedHttp),
    share: new HttpShareService(sharedHttp),
    admin: new HttpAdminService(http),
    status: new HttpStatusService(),
  }), [sharedHttp]);

  return (
    <ServicesProvider value={sharedServices}>
      <ToastProvider>
        <SharedShell token={token} />
      </ToastProvider>
    </ServicesProvider>
  );
}

function SharedShell({ token }: { token: string }) {
  const shareApi = useService('share');
  const tripsApi = useService('trips');
  const { show } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await shareApi.resolveShare(token);
        if (cancelled) return;
        setAccessLevel(info.accessLevel);
        const t = await tripsApi.get(info.tripId);
        if (cancelled) return;
        setTrip(t);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Token nije validan ili je istekao.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shareApi, tripsApi, token]);

  const handleUpdate = async (next: Trip) => {
    setTrip(next);
  };

  if (loading) {
    return (
      <FullScreenMessage
        kicker="DELJENI PLAN"
        title="Učitavanje…"
        subtitle="Provera deljenog tokena."
      />
    );
  }

  if (error || !trip) {
    return (
      <FullScreenMessage
        kicker="DELJENI PLAN"
        title="Token nije validan"
        subtitle={error ?? 'Token nije pronađen ili je istekao.'}
        actionLabel="Otvori početnu"
        onAction={() => {
          window.location.href = '/';
        }}
      />
    );
  }

  return (
    <div className="app">
      <SharedTopNav accessLevel={accessLevel} tripName={trip.naziv} />
      <TripDetail
        trip={trip}
        accessLevel={accessLevel}
        onBack={() => {
          window.location.href = '/';
        }}
        onShare={() => show('Već gledate kao gost — share modal je zaključan.')}
        onPdfExport={() => show('PDF preuzimanje za deljeni plan dolazi uskoro.')}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

function SharedTopNav({
  accessLevel,
  tripName,
}: {
  accessLevel: 'view' | 'edit';
  tripName: string;
}) {
  return (
    <nav className="topnav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div className="topnav-brand">
          <div className="topnav-brand-mark">P</div>
          <span>Putopis</span>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
          }}
        >
          Deljeni pregled · {tripName}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          className="chip mono"
          style={{
            background: accessLevel === 'edit' ? 'var(--terra)' : 'var(--ink)',
            color: 'var(--paper)',
            borderColor: 'transparent',
          }}
        >
          {accessLevel === 'edit' ? 'GOST · UREĐIVANJE' : 'GOST · SAMO PREGLED'}
        </span>
      </div>
    </nav>
  );
}

function FullScreenMessage({
  kicker,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 32,
        background: 'var(--bg)',
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
        — {kicker}
      </div>
      <h1
        className="serif"
        style={{
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          margin: 0,
          fontWeight: 400,
          textAlign: 'center',
        }}
      >
        {title}
      </h1>
      <div
        style={{
          color: 'var(--ink-2)',
          fontSize: 15,
          maxWidth: 440,
          textAlign: 'center',
          lineHeight: 1.55,
        }}
      >
        {subtitle}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn btn-terra"
          style={{ marginTop: 12 }}
        >
          {actionLabel} <Icon.arrow />
        </button>
      )}
    </div>
  );
}

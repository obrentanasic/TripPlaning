import { useState } from 'react';
import type { Trip } from '../../models/Trip';
import { daysBetween, fmtDate } from '../../lib/format';
import { Icon } from '../ui/Icon';
import { TabPregled } from './tabs/TabPregled';
import { TabDestinacije } from './tabs/TabDestinacije';
import { TabDani } from './tabs/TabDani';
import { TabTroskovi } from './tabs/TabTroskovi';
import { TabChecklist } from './tabs/TabChecklist';
import { TabBiljeske } from './tabs/TabBiljeske';

interface Props {
  trip: Trip;
  accessLevel?: 'view' | 'edit';
  onBack: () => void;
  onShare: () => void;
  onPdfExport: () => void;
  onUpdate: (t: Trip) => void;
}

type TabId = 'pregled' | 'destinacije' | 'dani' | 'troskovi' | 'checklist' | 'beleske';

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
}

export function TripDetail({
  trip,
  accessLevel = 'edit',
  onBack,
  onShare,
  onPdfExport,
  onUpdate,
}: Props) {
  const [tab, setTab] = useState<TabId>('pregled');
  const canEdit = accessLevel === 'edit';
  const dani = daysBetween(trip.pocetak, trip.kraj);

  const tabs: TabDef[] = [
    { id: 'pregled', label: 'Pregled' },
    { id: 'destinacije', label: 'Destinacije', count: trip.destinacije.length },
    { id: 'dani', label: 'Dani', count: trip.aktivnosti.length },
    { id: 'troskovi', label: 'Troškovi', count: trip.troskovi.length },
    { id: 'checklist', label: 'Checklist', count: trip.checklist.length },
    { id: 'beleske', label: 'Beleške' },
  ];

  return (
    <div className="fade-in">
      {/* Hero */}
      <div
        style={{
          position: 'relative',
          height: 380,
          overflow: 'hidden',
          background: 'var(--ink)',
        }}
      >
        {trip.kover && (
          <img
            src={trip.kover}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.7,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(26,22,18,0.4) 0%, rgba(26,22,18,0.85) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            height: '100%',
            maxWidth: 1400,
            margin: '0 auto',
            padding: '24px 32px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'var(--paper)',
          }}
        >
          <div>
            <button
              onClick={onBack}
              className="mono"
              style={{
                background: 'rgba(251,247,240,0.12)',
                border: '1px solid rgba(251,247,240,0.3)',
                color: 'var(--paper)',
                padding: '6px 12px',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
                <Icon.arrow />
              </span>{' '}
              Svi planovi
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 32,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  opacity: 0.7,
                  marginBottom: 14,
                }}
              >
                {fmtDate(trip.pocetak)} → {fmtDate(trip.kraj)} · {dani} dana
                {!canEdit && (
                  <span
                    style={{
                      marginLeft: 12,
                      padding: '2px 8px',
                      background: 'var(--gold)',
                      color: 'var(--ink)',
                      borderRadius: 2,
                    }}
                  >
                    READ ONLY
                  </span>
                )}
              </div>
              <h1
                className="serif"
                style={{
                  fontSize: 80,
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  fontWeight: 400,
                  maxWidth: 900,
                }}
              >
                {trip.naziv}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                className="btn btn-ghost"
                style={{
                  background: 'rgba(251,247,240,0.92)',
                  borderColor: 'rgba(251,247,240,0.92)',
                  color: 'var(--ink)',
                }}
                onClick={onPdfExport}
              >
                <Icon.download /> PDF
              </button>
              <button
                className="btn"
                style={{
                  background: 'var(--terra)',
                  borderColor: 'var(--terra)',
                }}
                onClick={onShare}
              >
                <Icon.share /> Podeli
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          background: 'var(--paper)',
          position: 'sticky',
          top: 60,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            overflowX: 'auto',
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'transparent',
                border: 0,
                padding: '16px 16px',
                fontSize: 14,
                color: tab === t.id ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: tab === t.id ? 500 : 400,
                borderBottom:
                  tab === t.id ? '2px solid var(--terra)' : '2px solid transparent',
                marginBottom: -1,
                whiteSpace: 'nowrap',
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
          <div style={{ flex: 1 }} />
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        {tab === 'pregled' && (
          <TabPregled trip={trip} setTab={(t) => setTab(t as TabId)} />
        )}
        {tab === 'destinacije' && (
          <TabDestinacije trip={trip} canEdit={canEdit} onUpdate={onUpdate} />
        )}
        {tab === 'dani' && (
          <TabDani trip={trip} canEdit={canEdit} onUpdate={onUpdate} />
        )}
        {tab === 'troskovi' && (
          <TabTroskovi trip={trip} canEdit={canEdit} onUpdate={onUpdate} />
        )}
        {tab === 'checklist' && (
          <TabChecklist trip={trip} canEdit={canEdit} onUpdate={onUpdate} />
        )}
        {tab === 'beleske' && (
          <TabBiljeske trip={trip} canEdit={canEdit} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

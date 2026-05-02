import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { SaradnikUloga, Trip } from '../../models/Trip';
import { Icon } from '../ui/Icon';

interface Props {
  trip: Trip;
  onClose: () => void;
  onAddCollab: (collab: { ime: string; email: string; uloga: SaradnikUloga }) => void;
}

const shareBase =
  (import.meta.env.VITE_SHARE_BASE_URL as string | undefined) ??
  `${window.location.origin}/share`;

const tokenStub = (tripId: string, level: SaradnikUloga) =>
  `${tripId}-${level === 'edit' ? 'e' : 'v'}-${Math.random().toString(36).slice(2, 7)}`;

export function ShareModal({ trip, onClose, onAddCollab }: Props) {
  const [accessLevel, setAccessLevel] = useState<SaradnikUloga>('view');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(() => tokenStub(trip.id, 'view'));

  const url = `${shareBase}/${token}`;
  const expiresAt = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('sr-Latn', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [token]);

  const switchLevel = (next: SaradnikUloga) => {
    setAccessLevel(next);
    setToken(tokenStub(trip.id, next));
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable on some hosts; ignore
    }
  };

  const downloadQr = () => {
    const svg = document.querySelector<SVGSVGElement>('#putopis-share-qr');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `putopis-${trip.id}-${accessLevel}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const sendInvite = () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@')) return;
    onAddCollab({
      ime: trimmed.split('@')[0],
      email: trimmed,
      uloga: accessLevel,
    });
    setEmail('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '28px 32px',
            borderBottom: '1px solid var(--rule)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 6,
              }}
            >
              Dijeljenje plana
            </div>
            <h2
              className="serif"
              style={{ fontSize: 32, margin: 0, fontWeight: 400, lineHeight: 1.1 }}
            >
              Podelite "{trip.naziv}"
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon">
            <Icon.close />
          </button>
        </div>

        <div style={{ padding: 32 }}>
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
            Nivo pristupa
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginBottom: 24,
            }}
          >
            {(
              [
                {
                  id: 'view' as const,
                  label: 'Samo pregled',
                  desc: 'Drugi korisnici mogu videti plan, ali ne mogu menjati podatke.',
                },
                {
                  id: 'edit' as const,
                  label: 'Uređivanje',
                  desc: 'Drugi korisnici mogu mijenjati destinacije, aktivnosti i troškove.',
                },
              ]
            ).map((a) => (
              <button
                key={a.id}
                onClick={() => switchLevel(a.id)}
                style={{
                  padding: 16,
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: accessLevel === a.id ? 'var(--ink)' : 'var(--rule)',
                  background:
                    accessLevel === a.id ? 'var(--ink)' : 'var(--paper)',
                  color: accessLevel === a.id ? 'var(--paper)' : 'var(--ink)',
                  borderRadius: 2,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <div
                  style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}
                >
                  {a.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      accessLevel === a.id
                        ? 'rgba(251,247,240,0.7)'
                        : 'var(--ink-3)',
                    lineHeight: 1.4,
                  }}
                >
                  {a.desc}
                </div>
              </button>
            ))}
          </div>

          {/* QR + URL */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gap: 24,
              alignItems: 'center',
              padding: 20,
              background: 'var(--bg-2)',
              border: '1px solid var(--rule)',
            }}
          >
            <div
              style={{
                background: 'var(--paper)',
                padding: 8,
                border: '1px solid var(--rule)',
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QRCodeSVG
                id="putopis-share-qr"
                value={url}
                size={184}
                bgColor="#FBF7F0"
                fgColor="#1A1612"
                level="M"
              />
            </div>
            <div>
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
                Skenirajte ili kopirajte link
              </div>
              <div
                style={{
                  padding: '10px 12px',
                  background: 'var(--paper)',
                  border: '1px solid var(--rule)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  wordBreak: 'break-all',
                  marginBottom: 10,
                }}
              >
                {url}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-sm"
                  onClick={copy}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {copied ? (
                    <>
                      <Icon.check /> Kopirano
                    </>
                  ) : (
                    <>
                      <Icon.copy /> Kopiraj link
                    </>
                  )}
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={downloadQr}
                  title="Preuzmi QR kao SVG"
                >
                  <Icon.download />
                </button>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: 'var(--ink-3)',
                  marginTop: 10,
                  letterSpacing: '0.08em',
                }}
              >
                Token istječe {expiresAt} · Token tip: {accessLevel.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Email invite */}
          <div style={{ marginTop: 24 }}>
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
              Pozovi e-mailom
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@adresa.com"
                onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
              />
              <button className="btn btn-terra btn-sm" onClick={sendInvite}>
                Pošalji
              </button>
            </div>
          </div>

          {/* Collaborators */}
          {trip.saradnici.length > 0 && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid var(--rule)',
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  marginBottom: 12,
                }}
              >
                Trenutni saradnici ({trip.saradnici.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trip.saradnici.map((s, i) => (
                  <div
                    key={`${s.email}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 10,
                      background: 'var(--bg-2)',
                    }}
                  >
                    <div
                      className="avatar"
                      style={{
                        background: i % 2 === 0 ? 'var(--forest)' : 'var(--gold)',
                        width: 32,
                        height: 32,
                        fontSize: 12,
                      }}
                    >
                      {s.ime
                        .split(' ')
                        .map((p) => p[0])
                        .join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{s.ime}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {s.email}
                      </div>
                    </div>
                    <span
                      className={`chip mono ${s.uloga === 'edit' ? 'chip-terra' : ''}`}
                      style={{ fontSize: 9 }}
                    >
                      {s.uloga.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { AccessLevel, Trip } from '../../models/Trip';
import { useService } from '../../hooks/useService';
import { useToast } from '../../context/ToastContext';
import { Icon } from '../ui/Icon';

interface Props {
  trip: Trip;
  onClose: () => void;
}

export function ShareModal({ trip, onClose }: Props) {
  const shareApi = useService('share');
  const { show } = useToast();

  const [accessLevel, setAccessLevel] = useState<AccessLevel>('view');
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Issue a token whenever the access level changes (or on first open).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCopied(false);
    shareApi
      .issueShare(trip.id, accessLevel)
      .then((res) => {
        if (cancelled) return;
        setToken(res.token);
        setUrl(res.url);
        setExpiresAt(res.expiresAt);
      })
      .catch((err) => {
        if (cancelled) return;
        show(err instanceof Error ? err.message : 'Greška pri kreiranju share linka.');
        setToken(null);
        setUrl('');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareApi, trip.id, accessLevel, show]);

  const expiresLabel = expiresAt
    ? new Date(expiresAt).toLocaleDateString('sr-Latn', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
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
              Deljenje plana
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
                  desc: 'Drugi korisnici mogu menjati destinacije, aktivnosti i troškove.',
                },
              ]
            ).map((a) => (
              <button
                key={a.id}
                onClick={() => setAccessLevel(a.id)}
                disabled={loading}
                style={{
                  padding: 16,
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: accessLevel === a.id ? 'var(--ink)' : 'var(--rule)',
                  background:
                    accessLevel === a.id ? 'var(--ink)' : 'var(--paper)',
                  color: accessLevel === a.id ? 'var(--paper)' : 'var(--ink)',
                  borderRadius: 2,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
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
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
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
              {url ? (
                <QRCodeSVG
                  id="putopis-share-qr"
                  value={url}
                  size={184}
                  bgColor="#FBF7F0"
                  fgColor="#1A1612"
                  level="M"
                />
              ) : (
                <div
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--ink-3)' }}
                >
                  …
                </div>
              )}
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
                  minHeight: 40,
                }}
              >
                {url || (loading ? 'Generišem…' : '—')}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-sm"
                  onClick={copy}
                  disabled={!url || loading}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    opacity: !url || loading ? 0.6 : 1,
                  }}
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
                  disabled={!url}
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
                {token
                  ? `Token ističe ${expiresLabel} · Token tip: ${accessLevel.toUpperCase()}`
                  : 'Token nije generisan.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

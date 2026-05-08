import { useEffect, useState } from 'react';

interface ServiceProbe {
  name: string;
  url: string;
  type: 'stateless' | 'stateful';
  status: 'unknown' | 'ok' | 'down';
  latencyMs?: number;
  payload?: unknown;
}

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/api';

const gatewayHealth = apiBase.replace(/\/api\/?$/, '/health');

const initial: ServiceProbe[] = [
  { name: 'Gateway',       url: gatewayHealth,                          type: 'stateless', status: 'unknown' },
  { name: 'UsersService',  url: 'http://localhost:8081/health',         type: 'stateless', status: 'unknown' },
  { name: 'TripsService',  url: 'http://localhost:8082/health',         type: 'stateless', status: 'unknown' },
  { name: 'ShareService',  url: 'http://localhost:8083/health',         type: 'stateful',  status: 'unknown' },
];

async function probe(p: ServiceProbe): Promise<ServiceProbe> {
  const start = performance.now();
  try {
    const res = await fetch(p.url, { method: 'GET' });
    const elapsed = Math.round(performance.now() - start);
    if (!res.ok) return { ...p, status: 'down', latencyMs: elapsed };
    const payload = await res.json().catch(() => undefined);
    return { ...p, status: 'ok', latencyMs: elapsed, payload };
  } catch {
    return { ...p, status: 'down', latencyMs: Math.round(performance.now() - start) };
  }
}

export function ServicesStatus() {
  const [probes, setProbes] = useState<ServiceProbe[]>(initial);
  const [refreshAt, setRefreshAt] = useState<Date | null>(null);

  const refresh = async () => {
    const results = await Promise.all(initial.map(probe));
    setProbes(results);
    setRefreshAt(new Date());
  };

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
          }}
        >
          Auto-refresh svakih 15 sekundi
          {refreshAt && (
            <>
              {' '}
              · poslednji put{' '}
              {refreshAt.toLocaleTimeString('sr-Latn', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={refresh}>
          Osveži
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {probes.map((p) => (
          <div key={p.name} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 4,
              }}
            >
              <div className="serif" style={{ fontSize: 22 }}>
                {p.name}
              </div>
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color:
                    p.status === 'ok'
                      ? 'var(--forest)'
                      : p.status === 'down'
                        ? 'var(--danger)'
                        : 'var(--ink-3)',
                }}
              >
                ● {p.status === 'ok' ? 'Online' : p.status === 'down' ? 'Down' : 'Probing…'}
              </span>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: 'var(--ink-3)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Tip: {p.type === 'stateful' ? 'STATEFUL' : 'STATELESS'}
              {typeof p.latencyMs === 'number' && ` · ${p.latencyMs}ms`}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: 'var(--ink-2)',
                wordBreak: 'break-all',
                background: 'var(--bg-2)',
                padding: 8,
                borderRadius: 2,
                minHeight: 32,
              }}
            >
              {p.payload ? JSON.stringify(p.payload) : p.url}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

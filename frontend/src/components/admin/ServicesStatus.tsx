import { useCallback, useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import type { ServiceProbe } from '../../services/status.service';

export function ServicesStatus() {
  const statusApi = useService('status');
  const [probes, setProbes] = useState<ServiceProbe[]>(() => statusApi.targets());
  const [refreshAt, setRefreshAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    const results = await statusApi.probeAll();
    setProbes(results);
    setRefreshAt(new Date());
  }, [statusApi]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(id);
  }, [refresh]);

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

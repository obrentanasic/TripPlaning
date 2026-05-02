interface Stat {
  label: string;
  value: string | number;
  sub: string;
}

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        gap: 0,
        marginBottom: 40,
        border: '1px solid var(--rule)',
        background: 'var(--paper)',
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            padding: '20px 24px',
            borderRight: i < stats.length - 1 ? '1px solid var(--rule)' : 0,
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
            {s.label}
          </div>
          <div
            className="serif"
            style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.01em' }}
          >
            {s.value}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        padding: 32,
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
        — No. 014 — Proljeće 2026
      </div>
      <h1
        className="serif"
        style={{
          fontSize: 96,
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          margin: 0,
          fontWeight: 400,
        }}
      >
        Putopis<em style={{ color: 'var(--terra)' }}>.</em>
      </h1>
      <div
        style={{
          color: 'var(--ink-2)',
          fontSize: 15,
          maxWidth: 480,
          textAlign: 'center',
          lineHeight: 1.55,
        }}
      >
        Sistem za planiranje putovanja — destinacije, dnevni raspored, troškovi i lista
        za pakovanje na jednom mjestu.
      </div>
      <div
        className="mono"
        style={{
          marginTop: 32,
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        Checkpoint 1 — design tokens loaded
      </div>
    </div>
  );
}

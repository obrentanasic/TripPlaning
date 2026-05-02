interface Props {
  title: string;
  checkpoint: string;
}

export function TabPlaceholder({ title, checkpoint }: Props) {
  return (
    <div
      style={{
        padding: '64px 0',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        Slijedi u {checkpoint}
      </div>
      <div className="serif" style={{ fontSize: 36 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--ink-3)',
          maxWidth: 360,
        }}
      >
        Tab je vidljiv ali sadržaj se gradi u sledećem checkpointu plana.
      </div>
    </div>
  );
}

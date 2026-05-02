interface Props {
  title: string;
  count?: number;
  action?: () => void;
  actionLabel?: string;
}

export function SectionHeader({ title, count, action, actionLabel }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '1px solid var(--rule)',
        paddingBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <h2
          className="serif"
          style={{
            fontSize: 34,
            margin: 0,
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h2>
        {typeof count === 'number' && (
          <span className="num-tag">N° {String(count).padStart(2, '0')}</span>
        )}
      </div>
      {action && (
        <button
          onClick={action}
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--terra)',
            background: 'none',
            border: 0,
            cursor: 'pointer',
          }}
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

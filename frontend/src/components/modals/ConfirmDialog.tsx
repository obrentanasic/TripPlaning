interface Props {
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export function ConfirmDialog({
  title,
  body,
  onConfirm,
  onCancel,
  confirmLabel = 'Potvrdi',
}: Props) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px 28px' }}>
          <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>
            {title}
          </div>
          <div
            style={{
              color: 'var(--ink-2)',
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            {body}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>
              Otkaži
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';

export type TopView = 'dashboard' | 'trip' | 'admin';

interface Props {
  view: TopView;
  onNavigate: (view: 'dashboard' | 'admin') => void;
}

export function TopNav({ view, onNavigate }: Props) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.ime
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <nav className="topnav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div
          className="topnav-brand"
          onClick={() => onNavigate('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <div className="topnav-brand-mark">P</div>
          <span>Putopis</span>
        </div>
        <div className="topnav-tabs">
          <button
            className={`topnav-tab ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Planovi
          </button>
          {user.uloga === 'admin' && (
            <button
              className={`topnav-tab ${view === 'admin' ? 'active' : ''}`}
              onClick={() => onNavigate('admin')}
            >
              Admin
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="topnav-user">
          <div style={{ fontSize: 12 }}>
            <div style={{ lineHeight: 1.2 }}>{user.ime}</div>
            <div
              className="mono"
              style={{
                fontSize: 9,
                color: 'var(--ink-3)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {user.uloga}
            </div>
          </div>
          <div
            className="avatar"
            style={{
              background: user.uloga === 'admin' ? 'var(--terra)' : 'var(--forest)',
            }}
          >
            {initials}
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm btn-icon"
          title="Odjavi se"
        >
          <Icon.logout />
        </button>
      </div>
    </nav>
  );
}

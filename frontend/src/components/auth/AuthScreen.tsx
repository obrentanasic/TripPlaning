import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';

type Mode = 'login' | 'register';

interface FormState {
  ime: string;
  email: string;
  lozinka: string;
  lozinka2: string;
}

interface FormErrors {
  ime?: string;
  email?: string;
  lozinka?: string;
  lozinka2?: string;
  submit?: string;
}

const HERO =
  'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1400&q=80';

export function AuthScreen() {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<FormState>({
    ime: '',
    email: 'lana@email.com',
    lozinka: '••••••••',
    lozinka2: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const e: FormErrors = {};
    if (mode === 'register' && !form.ime.trim()) e.ime = 'Ime je obavezno';
    if (!form.email.includes('@')) e.email = 'Neispravan email';
    if (form.lozinka.length < 6)
      e.lozinka = 'Lozinka mora imati najmanje 6 karaktera';
    if (mode === 'register' && form.lozinka !== form.lozinka2)
      e.lozinka2 = 'Lozinke se ne poklapaju';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      if (mode === 'login') {
        await login({ email: form.email, lozinka: form.lozinka });
      } else {
        await register({ ime: form.ime, email: form.email, lozinka: form.lozinka });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Greška pri prijavi';
      setErrors({ submit: message });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left — hero imagery */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--ink)' }}>
        <img
          src={HERO}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(26,22,18,0.6), rgba(181,86,58,0.35))',
          }}
        />
        <div
          style={{
            position: 'relative',
            height: '100%',
            padding: 56,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'var(--paper)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="topnav-brand-mark"
              style={{ background: 'var(--paper)', color: 'var(--ink)' }}
            >
              P
            </div>
            <span className="serif" style={{ fontSize: 24, color: 'var(--paper)' }}>
              Putopis
            </span>
          </div>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                opacity: 0.7,
                marginBottom: 24,
              }}
            >
              No. 014 — Proljeće 2026
            </div>
            <div
              className="serif"
              style={{ fontSize: 64, lineHeight: 0.95, letterSpacing: '-0.02em' }}
            >
              Planirajte
              <br />
              <em>putovanje</em> do
              <br />
              najmanjeg detalja.
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 15,
                opacity: 0.85,
                maxWidth: 440,
                lineHeight: 1.55,
              }}
            >
              Destinacije, dnevni raspored, troškovi i lista za pakovanje — sve na jednom
              mestu, spremno za deljenje.
            </div>
          </div>
          <div
            className="mono"
            style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.1em' }}
          >
            © 2026 — Sistem za planiranje putovanja
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          background: 'var(--bg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 12,
            }}
          >
            {mode === 'login' ? '— Prijava na sistem' : '— Nova registracija'}
          </div>
          <div
            className="serif"
            style={{
              fontSize: 44,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            {mode === 'login' ? 'Dobrodošli nazad.' : 'Kreirajte nalog.'}
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 32 }}>
            {mode === 'login'
              ? 'Prijavite se i nastavite gde ste stali.'
              : 'Par detalja i krećemo.'}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div className="field">
                <label>Ime i prezime</label>
                <input
                  value={form.ime}
                  onChange={(e) => setForm({ ...form, ime: e.target.value })}
                  placeholder="npr. Marko Petrović"
                />
                {errors.ime && (
                  <div style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.ime}</div>
                )}
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vasa@adresa.com"
              />
              {errors.email && (
                <div style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.email}</div>
              )}
            </div>
            <div className="field">
              <label>Lozinka</label>
              <input
                type="password"
                value={form.lozinka}
                onChange={(e) => setForm({ ...form, lozinka: e.target.value })}
                placeholder="••••••••"
              />
              {errors.lozinka && (
                <div style={{ color: 'var(--danger)', fontSize: 12 }}>{errors.lozinka}</div>
              )}
            </div>
            {mode === 'register' && (
              <div className="field">
                <label>Potvrdite lozinku</label>
                <input
                  type="password"
                  value={form.lozinka2}
                  onChange={(e) => setForm({ ...form, lozinka2: e.target.value })}
                  placeholder="••••••••"
                />
                {errors.lozinka2 && (
                  <div style={{ color: 'var(--danger)', fontSize: 12 }}>
                    {errors.lozinka2}
                  </div>
                )}
              </div>
            )}

            {errors.submit && (
              <div
                style={{
                  color: 'var(--danger)',
                  fontSize: 13,
                  padding: '8px 12px',
                  background: 'rgba(168,52,30,0.06)',
                  border: '1px solid var(--danger)',
                  borderRadius: 2,
                }}
              >
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-terra"
              style={{
                marginTop: 8,
                padding: '14px 18px',
                justifyContent: 'center',
                fontSize: 14,
              }}
              disabled={loading}
            >
              {loading
                ? 'Čekajte...'
                : mode === 'login'
                  ? 'Prijavi se'
                  : 'Registruj se'}
              {!loading && <Icon.arrow />}
            </button>

            
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: 13,
              color: 'var(--ink-2)',
            }}
          >
            {mode === 'login' ? 'Nemate nalog?' : 'Već imate nalog?'}{' '}
            <button
              onClick={() => {
                setErrors({});
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              style={{
                background: 'none',
                border: 0,
                color: 'var(--terra)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                padding: 0,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {mode === 'login' ? 'Registrujte se' : 'Prijavite se'}
            </button>
          </div>

          <div
            style={{
              marginTop: 32,
              padding: 12,
              background: 'var(--bg-2)',
              border: '1px solid var(--rule)',
              borderRadius: 2,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 4,
              }}
            >
              Demo nalog
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              <code>lana@email.com</code> → admin · <code>marko@email.com</code> →
              korisnik
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

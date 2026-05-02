import type { Trip } from '../../../models/Trip';
import { KATEGORIJE_TROSKOVA } from '../../../models/Trip';
import { fmtCurrency, fmtDateShort } from '../../../lib/format';
import { SectionHeader } from '../shared/SectionHeader';
import { ActivityRow } from '../shared/ActivityRow';

interface Props {
  trip: Trip;
  setTab: (tab: string) => void;
}

export function TabPregled({ trip, setTab }: Props) {
  const trosak = trip.troskovi.reduce((s, t) => s + t.iznos, 0);
  const ostalo = trip.budzet - trosak;
  const procenat = trip.budzet
    ? Math.min(100, Math.round((trosak / trip.budzet) * 100))
    : 0;
  const zavrseno = trip.checklist.filter((c) => c.zavrseno).length;
  const checkProc = trip.checklist.length
    ? Math.round((zavrseno / trip.checklist.length) * 100)
    : 0;

  const todayActivities = trip.aktivnosti.slice(0, 4);
  const kategPotrosnja = KATEGORIJE_TROSKOVA.map((k) => ({
    ...k,
    iznos: trip.troskovi
      .filter((t) => t.kategorija === k.id)
      .reduce((s, t) => s + t.iznos, 0),
  })).filter((k) => k.iznos > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Description */}
        <div className="card" style={{ padding: 28 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 12,
            }}
          >
            O putovanju
          </div>
          <div
            className="serif"
            style={{ fontSize: 22, lineHeight: 1.4, color: 'var(--ink)' }}
          >
            {trip.opis || 'Opis nije unesen.'}
          </div>
        </div>

        {/* Destinations strip */}
        <div>
          <SectionHeader
            title="Destinacije"
            count={trip.destinacije.length}
            action={() => setTab('destinacije')}
            actionLabel="Sve"
          />
          {trip.destinacije.length === 0 ? (
            <EmptyHint>Još niste dodali nijednu destinaciju.</EmptyHint>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              {trip.destinacije.map((d, i) => (
                <div key={d.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '4/3', background: 'var(--bg-2)' }}>
                    {d.foto ? (
                      <img
                        src={d.foto}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        className="stripe-ph"
                        style={{ width: '100%', height: '100%' }}
                      >
                        {d.naziv}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 14 }}>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.14em',
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Stop {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>
                      {d.naziv}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--ink-3)',
                        marginTop: 4,
                      }}
                    >
                      {fmtDateShort(d.dolazak)} — {fmtDateShort(d.odlazak)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today / next activities */}
        <div>
          <SectionHeader
            title="Predstojeće aktivnosti"
            count={trip.aktivnosti.length}
            action={() => setTab('dani')}
            actionLabel="Ceo raspored"
          />
          {trip.aktivnosti.length === 0 ? (
            <EmptyHint>Nema unesenih aktivnosti za ovo putovanje.</EmptyHint>
          ) : (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {todayActivities.map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Budget card */}
        <div className="card" style={{ padding: 24 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 12,
            }}
          >
            Budžet
          </div>
          <div
            className="serif"
            style={{ fontSize: 44, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {fmtCurrency(ostalo, trip.valuta)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            preostalo od {fmtCurrency(trip.budzet, trip.valuta)}
          </div>

          <div
            style={{
              height: 6,
              background: 'var(--bg-2)',
              borderRadius: 3,
              overflow: 'hidden',
              margin: '20px 0 8px',
            }}
          >
            <div
              style={{
                width: `${procenat}%`,
                height: '100%',
                background: procenat > 90 ? 'var(--danger)' : 'var(--terra)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--ink-3)',
            }}
          >
            <span>{procenat}% iskorišćeno</span>
            <span>{fmtCurrency(trosak, trip.valuta)} potrošeno</span>
          </div>

          {kategPotrosnja.length > 0 && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: '1px solid var(--rule)',
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-3)',
                  marginBottom: 12,
                }}
              >
                Po kategoriji
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {kategPotrosnja.map((k) => (
                  <div
                    key={k.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: k.boja,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, flex: 1 }}>{k.naziv}</span>
                    <span
                      className="mono"
                      style={{ fontSize: 12, color: 'var(--ink-2)' }}
                    >
                      {fmtCurrency(k.iznos, trip.valuta)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Checklist progress */}
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 12,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
              }}
            >
              Lista pakovanja
            </div>
            <button
              onClick={() => setTab('checklist')}
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--terra)',
                background: 'none',
                border: 0,
                cursor: 'pointer',
              }}
            >
              Otvori →
            </button>
          </div>
          <div className="serif" style={{ fontSize: 36, lineHeight: 1 }}>
            {zavrseno}
            <span style={{ color: 'var(--ink-3)' }}> / {trip.checklist.length}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            stavki spakovano
          </div>
          <div
            style={{
              height: 6,
              background: 'var(--bg-2)',
              borderRadius: 3,
              overflow: 'hidden',
              marginTop: 16,
            }}
          >
            <div
              style={{
                width: `${checkProc}%`,
                height: '100%',
                background: 'var(--forest)',
              }}
            />
          </div>
        </div>

        {/* Collaborators */}
        <div className="card" style={{ padding: 24 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 12,
            }}
          >
            Saradnici
          </div>
          {trip.saradnici.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              Niste podelili plan ni sa kim.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trip.saradnici.map((s, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <div
                    className="avatar"
                    style={{
                      background: i % 2 === 0 ? 'var(--forest)' : 'var(--gold)',
                      width: 32,
                      height: 32,
                      fontSize: 12,
                    }}
                  >
                    {s.ime
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13 }}>{s.ime}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.email}</div>
                  </div>
                  <span className="chip mono" style={{ fontSize: 9 }}>
                    {s.uloga.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: '24px 16px',
        border: '1.5px dashed var(--rule-2)',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--ink-3)',
      }}
    >
      {children}
    </div>
  );
}

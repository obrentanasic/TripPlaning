import { useEffect, useState } from 'react';
import type { Trip } from '../../../models/Trip';
import { daysBetween, fmtCurrency } from '../../../lib/format';
import { SectionHeader } from '../shared/SectionHeader';

interface Props {
  trip: Trip;
  canEdit: boolean;
  onUpdate: (t: Trip) => void;
}

function Fact({ k, v }: { k: string; v: string | number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: 6,
        borderBottom: '1px dashed var(--rule)',
      }}
    >
      <span style={{ color: 'var(--ink-3)' }}>{k}</span>
      <span className="mono">{v}</span>
    </div>
  );
}

export function TabBiljeske({ trip, canEdit, onUpdate }: Props) {
  const [tekst, setTekst] = useState(trip.napomene || '');

  useEffect(() => setTekst(trip.napomene || ''), [trip.id, trip.napomene]);

  const save = () => onUpdate({ ...trip, napomene: tekst });
  const dirty = tekst !== (trip.napomene || '');

  return (
    <div>
      <SectionHeader title="Beleške i podsetnici" />

      <div
        style={{
          margin: '20px 0',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
        }}
      >
        <div className="card" style={{ padding: 28, background: 'var(--paper)' }}>
          <textarea
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            disabled={!canEdit}
            placeholder="Dodajte beleške za putovanje..."
            style={{
              width: '100%',
              minHeight: 400,
              border: 0,
              padding: 0,
              background: 'transparent',
              fontFamily: 'Instrument Serif, serif',
              fontSize: 22,
              lineHeight: 1.6,
              color: 'var(--ink)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          {canEdit && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--rule)',
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {dirty ? 'Nesačuvane izmjene' : 'Sve sačuvano'}
              </div>
              <button
                className="btn btn-terra btn-sm"
                onClick={save}
                disabled={!dirty}
                style={{ opacity: dirty ? 1 : 0.5 }}
              >
                Sačuvaj beleške
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            className="card"
            style={{
              padding: 20,
              background: '#FBF4DD',
              borderColor: 'var(--gold)',
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 10,
              }}
            >
              Savjet
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              Dodajte podsjetnike o vizama, vakcinama, lokalnim običajima ili korisnim frazama na lokalnom jeziku.
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 10,
              }}
            >
              Brze činjenice
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: 13,
              }}
            >
              <Fact k="Trajanje" v={`${daysBetween(trip.pocetak, trip.kraj)} dana`} />
              <Fact k="Destinacija" v={`${trip.destinacije.length} lokacija`} />
              <Fact k="Aktivnosti" v={trip.aktivnosti.length} />
              <Fact k="Budžet" v={fmtCurrency(trip.budzet, trip.valuta)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

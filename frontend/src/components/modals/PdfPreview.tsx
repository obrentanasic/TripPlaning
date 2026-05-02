import jsPDF from 'jspdf';
import type { Trip } from '../../models/Trip';
import { KATEGORIJE_TROSKOVA } from '../../models/Trip';
import { daysBetween, fmtCurrency, fmtDate } from '../../lib/format';
import { Icon } from '../ui/Icon';

interface Props {
  trip: Trip;
  onClose: () => void;
}

function Block({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: '12px 16px', border: '1px solid var(--rule)' }}>
      <div
        className="mono"
        style={{
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        {label}
      </div>
      <div className="serif" style={{ fontSize: 24, lineHeight: 1.1, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function buildPdf(trip: Trip) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const page = doc.internal.pageSize;
  const margin = 56;
  const innerWidth = page.getWidth() - margin * 2;
  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y > page.getHeight() - margin - needed) {
      doc.addPage();
      y = margin;
    }
  };

  // Kicker
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(128, 118, 106);
  doc.text('PUTOPIS / IZVESTAJ', margin, y);
  y += 28;

  // Title
  doc.setFont('times', 'normal');
  doc.setFontSize(32);
  doc.setTextColor(26, 22, 18);
  doc.text(stripDiacritics(trip.naziv), margin, y);
  y += 28;

  // Date range
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(128, 118, 106);
  doc.text(
    `${fmtDate(trip.pocetak)} -> ${fmtDate(trip.kraj)} · ${daysBetween(trip.pocetak, trip.kraj)} dana`,
    margin,
    y
  );
  y += 24;

  // Divider
  doc.setDrawColor(217, 205, 184);
  doc.line(margin, y, page.getWidth() - margin, y);
  y += 24;

  // Description
  if (trip.opis) {
    doc.setFontSize(11);
    doc.setTextColor(74, 66, 57);
    const lines = doc.splitTextToSize(stripDiacritics(trip.opis), innerWidth);
    doc.text(lines, margin, y);
    y += lines.length * 16 + 24;
  }

  // Stats row
  const trosak = trip.troskovi.reduce((s, t) => s + t.iznos, 0);
  const gap = 14;
  const colW = (innerWidth - gap * 2) / 3;
  const boxH = 60;
  const stats = [
    { label: 'DESTINACIJE', value: String(trip.destinacije.length) },
    { label: 'AKTIVNOSTI', value: String(trip.aktivnosti.length) },
    { label: 'TROSAK', value: stripDiacritics(fmtCurrency(trosak, trip.valuta)) },
  ];
  stats.forEach((s, i) => {
    const x = margin + i * (colW + gap);
    doc.setDrawColor(217, 205, 184);
    doc.rect(x, y, colW, boxH);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(128, 118, 106);
    doc.text(s.label, x + 14, y + 18);
    doc.setFont('times', 'normal');
    doc.setFontSize(20);
    doc.setTextColor(26, 22, 18);
    doc.text(s.value, x + 14, y + 44);
  });
  y += boxH + 36;

  // Destinations
  if (trip.destinacije.length) {
    ensureSpace(60);
    doc.setFont('times', 'normal');
    doc.setFontSize(20);
    doc.setTextColor(26, 22, 18);
    doc.text('Destinacije', margin, y);
    y += 24;
    trip.destinacije.forEach((d, i) => {
      ensureSpace(48);
      doc.setTextColor(181, 86, 58);
      doc.setFont('times', 'normal');
      doc.setFontSize(16);
      doc.text(String(i + 1).padStart(2, '0'), margin, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(26, 22, 18);
      doc.text(stripDiacritics(`${d.naziv} · ${d.lokacija}`), margin + 36, y);

      doc.setFontSize(9);
      doc.setTextColor(128, 118, 106);
      doc.text(`${fmtDate(d.dolazak)} - ${fmtDate(d.odlazak)}`, margin + 36, y + 16);

      doc.setDrawColor(217, 205, 184);
      doc.line(margin, y + 30, page.getWidth() - margin, y + 30);
      y += 42;
    });
    y += 16;
  }

  // Expenses summary
  ensureSpace(120);
  doc.setFont('times', 'normal');
  doc.setFontSize(20);
  doc.setTextColor(26, 22, 18);
  doc.text('Sazetak troskova', margin, y);
  y += 24;

  KATEGORIJE_TROSKOVA.forEach((k) => {
    const sum = trip.troskovi
      .filter((t) => t.kategorija === k.id)
      .reduce((s, t) => s + t.iznos, 0);
    if (sum === 0) return;
    ensureSpace(28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(26, 22, 18);
    doc.text(stripDiacritics(k.naziv), margin, y);
    doc.text(stripDiacritics(fmtCurrency(sum, trip.valuta)), page.getWidth() - margin, y, {
      align: 'right',
    });
    doc.setDrawColor(217, 205, 184);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin, y + 6, page.getWidth() - margin, y + 6);
    doc.setLineDashPattern([], 0);
    y += 22;
  });

  // UKUPNO row
  ensureSpace(40);
  y += 8;
  doc.setDrawColor(26, 22, 18);
  doc.setLineWidth(1.5);
  doc.line(margin, y, page.getWidth() - margin, y);
  doc.setLineWidth(1);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('UKUPNO', margin, y);
  doc.text(
    stripDiacritics(`${fmtCurrency(trosak, trip.valuta)} / ${fmtCurrency(trip.budzet, trip.valuta)}`),
    page.getWidth() - margin,
    y,
    { align: 'right' }
  );

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(128, 118, 106);
  const footerY = page.getHeight() - margin / 2;
  doc.text(
    `Generisano: ${stripDiacritics(new Date().toLocaleString('sr-Latn'))}`,
    margin,
    footerY
  );
  doc.text(
    `Putopis · str. ${doc.getNumberOfPages()}`,
    page.getWidth() - margin,
    footerY,
    { align: 'right' }
  );

  doc.save(`putopis_${trip.id}.pdf`);
}

export function PdfPreview({ trip, onClose }: Props) {
  const trosak = trip.troskovi.reduce((s, t) => s + t.iznos, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          maxWidth: 720,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-2)',
            borderBottom: '1px solid var(--rule)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            PDF Pregled · putopis_{trip.id}.pdf
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => buildPdf(trip)}>
              <Icon.download /> Preuzmi
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon">
              <Icon.close />
            </button>
          </div>
        </div>

        <div style={{ padding: '48px 56px', minHeight: 600 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--ink-3)',
            }}
          >
            PUTOPIS / IZVEŠTAJ
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 56,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              margin: '12px 0 8px',
              fontWeight: 400,
            }}
          >
            {trip.naziv}
          </h1>
          <div
            className="mono"
            style={{ fontSize: 12, color: 'var(--ink-3)' }}
          >
            {fmtDate(trip.pocetak)} → {fmtDate(trip.kraj)} ·{' '}
            {daysBetween(trip.pocetak, trip.kraj)} dana
          </div>
          <hr className="divider" style={{ margin: '24px 0' }} />
          <div
            style={{
              fontSize: 14,
              color: 'var(--ink-2)',
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            {trip.opis || (
              <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>
                bez opisa
              </span>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <Block label="Destinacije" value={trip.destinacije.length} />
            <Block label="Aktivnosti" value={trip.aktivnosti.length} />
            <Block label="Trošak" value={fmtCurrency(trosak, trip.valuta)} />
          </div>

          <h2
            className="serif"
            style={{ fontSize: 28, margin: '0 0 12px', fontWeight: 400 }}
          >
            Destinacije
          </h2>
          <div style={{ marginBottom: 24 }}>
            {trip.destinacije.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--ink-3)',
                  fontStyle: 'italic',
                }}
              >
                Nema destinacija.
              </div>
            ) : (
              trip.destinacije.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--rule)',
                  }}
                >
                  <div
                    className="serif"
                    style={{
                      fontSize: 24,
                      color: 'var(--terra)',
                      minWidth: 36,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {d.naziv}{' '}
                      <span
                        style={{
                          color: 'var(--ink-3)',
                          fontWeight: 400,
                        }}
                      >
                        · {d.lokacija}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--ink-3)',
                        marginTop: 2,
                      }}
                    >
                      {fmtDate(d.dolazak)} — {fmtDate(d.odlazak)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2
            className="serif"
            style={{ fontSize: 28, margin: '0 0 12px', fontWeight: 400 }}
          >
            Sažetak troškova
          </h2>
          {KATEGORIJE_TROSKOVA.map((k) => {
            const sum = trip.troskovi
              .filter((t) => t.kategorija === k.id)
              .reduce((s, t) => s + t.iznos, 0);
            if (sum === 0) return null;
            return (
              <div
                key={k.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px dashed var(--rule)',
                }}
              >
                <span style={{ fontSize: 13 }}>{k.naziv}</span>
                <span className="mono">{fmtCurrency(sum, trip.valuta)}</span>
              </div>
            );
          })}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              marginTop: 8,
              borderTop: '2px solid var(--ink)',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>UKUPNO</span>
            <span
              className="mono"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              {fmtCurrency(trosak, trip.valuta)} /{' '}
              {fmtCurrency(trip.budzet, trip.valuta)}
            </span>
          </div>

          <div
            style={{
              marginTop: 48,
              paddingTop: 16,
              borderTop: '1px solid var(--rule)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 10, color: 'var(--ink-3)' }}
            >
              Generisano: {new Date().toLocaleString('sr-Latn')}
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: 'var(--ink-3)' }}
            >
              Putopis · str. 1/1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

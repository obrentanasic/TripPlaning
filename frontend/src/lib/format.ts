export const fmtCurrency = (n: number | undefined, c = 'EUR'): string => {
  if (typeof n !== 'number') return '—';
  return new Intl.NumberFormat('sr-Latn', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 0,
  }).format(n);
};

export const fmtDate = (iso: string | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('sr-Latn', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const fmtDateShort = (iso: string | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('sr-Latn', {
    day: '2-digit',
    month: 'short',
  });
};

export const fmtDay = (iso: string | undefined): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sr-Latn', { weekday: 'long' });
};

export const daysBetween = (a: string, b: string): number => {
  if (!a || !b) return 0;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2.getTime() - d1.getTime()) / 86_400_000) + 1;
};

export const eachDay = (a: string, b: string): string[] => {
  if (!a || !b) return [];
  const out: string[] = [];
  const d = new Date(a);
  const end = new Date(b);
  while (d <= end) {
    out.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return out;
};

export const uid = (): string => Math.random().toString(36).slice(2, 9);

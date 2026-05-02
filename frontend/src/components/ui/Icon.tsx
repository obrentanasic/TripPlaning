import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const stroke = '1.3';

export const Icon = {
  plus: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  close: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  edit: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M9 2l3 3-7 7H2v-3l7-7z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
    </svg>
  ),
  trash: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path
        d="M2 4h10M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M3 4l1 8a1 1 0 001 1h4a1 1 0 001-1l1-8"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  ),
  share: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="3.5" cy="7" r="1.5" stroke="currentColor" strokeWidth={stroke} />
      <circle cx="10.5" cy="3" r="1.5" stroke="currentColor" strokeWidth={stroke} />
      <circle cx="10.5" cy="11" r="1.5" stroke="currentColor" strokeWidth={stroke} />
      <path d="M5 6.3l4-2.6M5 7.7l4 2.6" stroke="currentColor" strokeWidth={stroke} />
    </svg>
  ),
  calendar: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <rect x="1.5" y="3" width="11" height="9.5" stroke="currentColor" strokeWidth={stroke} />
      <path d="M4 1.5v3M10 1.5v3M1.5 6h11" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  ),
  pin: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M7 12.5s-4-3.5-4-7a4 4 0 018 0c0 3.5-4 7-4 7z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
      <circle cx="7" cy="5.5" r="1.3" stroke="currentColor" strokeWidth={stroke} />
    </svg>
  ),
  clock: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth={stroke} />
      <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  ),
  arrow: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path
        d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M2.5 7.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  search: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth={stroke} />
      <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  ),
  qr: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <rect x="1.5" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth={stroke} />
      <rect x="8.5" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth={stroke} />
      <rect x="1.5" y="8.5" width="4" height="4" stroke="currentColor" strokeWidth={stroke} />
      <path
        d="M8.5 8.5h2v2M12.5 10.5v2h-2M8.5 12.5h0"
        stroke="currentColor"
        strokeWidth={stroke}
      />
    </svg>
  ),
  download: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path
        d="M7 1.5v8M3.5 6L7 9.5 10.5 6M2 12.5h10"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  copy: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <rect x="4" y="4" width="8" height="8" stroke="currentColor" strokeWidth={stroke} />
      <path d="M2 9V2h7" stroke="currentColor" strokeWidth={stroke} />
    </svg>
  ),
  globe: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth={stroke} />
      <ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth={stroke} />
      <path d="M1.5 7h11" stroke="currentColor" strokeWidth={stroke} />
    </svg>
  ),
  user: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth={stroke} />
      <path d="M2.5 12c.5-2.5 2.3-4 4.5-4s4 1.5 4.5 4" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  ),
  logout: (p: P) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}>
      <path
        d="M9 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v8a1 1 0 001 1h5a1 1 0 001-1v-1M6 7h7M11 4.5L13.5 7 11 9.5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

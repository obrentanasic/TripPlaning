export type AktivnostStatus = 'planirano' | 'rezervisano' | 'završeno' | 'otkazano';

export type KategorijaTroska =
  | 'prevoz'
  | 'smestaj'
  | 'hrana'
  | 'ulaznice'
  | 'kupovina'
  | 'ostalo';

export type KategorijaChecklist =
  | 'dokumenti'
  | 'tehnika'
  | 'garderoba'
  | 'higijena'
  | 'ostalo';

export type SaradnikUloga = 'view' | 'edit';

export interface Destinacija {
  id: string;
  naziv: string;
  lokacija: string;
  dolazak: string;
  odlazak: string;
  opis: string;
  foto?: string;
}

export interface Aktivnost {
  id: string;
  destId?: string;
  naziv: string;
  datum: string;
  vreme: string;
  lokacija: string;
  opis: string;
  trosak: number;
  status: AktivnostStatus;
}

export interface Trosak {
  id: string;
  naziv: string;
  kategorija: KategorijaTroska;
  iznos: number;
  datum: string;
  opis: string;
}

export interface ChecklistItem {
  id: string;
  naziv: string;
  kategorija: KategorijaChecklist;
  zavrseno: boolean;
}

export interface Saradnik {
  ime: string;
  email: string;
  uloga: SaradnikUloga;
}

export interface Trip {
  id: string;
  naziv: string;
  opis: string;
  pocetak: string;
  kraj: string;
  budzet: number;
  valuta: string;
  kover?: string;
  boja?: string;
  napomene: string;
  destinacije: Destinacija[];
  aktivnosti: Aktivnost[];
  troskovi: Trosak[];
  checklist: ChecklistItem[];
  saradnici: Saradnik[];
}

export interface KategorijaTroskaDef {
  id: KategorijaTroska;
  naziv: string;
  boja: string;
}

export interface KategorijaChecklistDef {
  id: KategorijaChecklist;
  naziv: string;
}

export const KATEGORIJE_TROSKOVA: KategorijaTroskaDef[] = [
  { id: 'prevoz', naziv: 'Prevoz', boja: '#B5563A' },
  { id: 'smestaj', naziv: 'Smeštaj', boja: '#3F5B43' },
  { id: 'hrana', naziv: 'Hrana', boja: '#C89B3C' },
  { id: 'ulaznice', naziv: 'Ulaznice', boja: '#8E3F26' },
  { id: 'kupovina', naziv: 'Kupovina', boja: '#80766A' },
  { id: 'ostalo', naziv: 'Ostalo', boja: '#4A4239' },
];

export const KATEGORIJE_CHECKLIST: KategorijaChecklistDef[] = [
  { id: 'dokumenti', naziv: 'Dokumenti' },
  { id: 'tehnika', naziv: 'Tehnika' },
  { id: 'garderoba', naziv: 'Garderoba' },
  { id: 'higijena', naziv: 'Higijena i lijekovi' },
  { id: 'ostalo', naziv: 'Ostalo' },
];

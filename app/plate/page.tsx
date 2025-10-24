'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Download,
  FileText,
  AlertCircle,
  Search,
  Trash2,
  Save
} from 'lucide-react';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type TipOdsustva =
  | 'bolovanje_do_60'
  | 'bolovanje_preko_60'
  | 'porodiljsko'
  | 'godisnji'
  | 'slobodni_dan'
  | 'smrtni_slucaj'
  | 'vjereski_praznik'
  | 'drzavni_praznik'
  | 'praznik';

interface Zaposleni {
  id: string;
  ime: string;
  prezime: string;
  jmbg?: string;
  pozicija?: string;
  aktivan: boolean;
}

interface DnevnaEvidencija {
  id: string;
  zaposleniId: string;
  datum: string; // YYYY-MM-DD
  radniSati: number;
  prekovremeni: number;
  tipOdsustva?: TipOdsustva;
  satiOdsustva: number;
  napomena?: string;
}

interface MjesecniIzvjestaj {
  zaposleniId: string;
  ukupnoRadnihSati: number;
  ukupnoPrekovremenih: number;
  bolovanje_do_60: number;
  bolovanje_preko_60: number;
  porodiljsko: number;
  godisnji: number;
  slobodni_dan: number;
  smrtni_slucaj: number;
  vjereski_praznik: number;
  drzavni_praznik: number;
  praznik: number;
  ukupnoOdsustva: number;
}

const TIPOVI_ODSUSTVA: ReadonlyArray<{
  value: TipOdsustva;
  label: string;
  colorClass: string;
}> = [
  { value: 'bolovanje_do_60', label: 'Bolovanje (do 60 dana)', colorClass: 'bg-orange-100 text-orange-800' },
  { value: 'bolovanje_preko_60', label: 'Bolovanje (preko 60 dana)', colorClass: 'bg-red-100 text-red-800' },
  { value: 'porodiljsko', label: 'Porodiljsko odsustvo', colorClass: 'bg-pink-100 text-pink-800' },
  { value: 'godisnji', label: 'Godišnji odmor', colorClass: 'bg-green-100 text-green-800' },
  { value: 'slobodni_dan', label: 'Slobodan dan', colorClass: 'bg-blue-100 text-blue-800' },
  { value: 'smrtni_slucaj', label: 'Smrtni slučaj', colorClass: 'bg-gray-200 text-gray-800' },
  { value: 'vjereski_praznik', label: 'Vjerski praznik', colorClass: 'bg-purple-100 text-purple-800' },
  { value: 'drzavni_praznik', label: 'Državni praznik', colorClass: 'bg-indigo-100 text-indigo-800' },
  { value: 'praznik', label: 'Praznik (Nova Godina i sl.)', colorClass: 'bg-yellow-100 text-yellow-800' }
];

const MJESECI = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function izracunajMjesecniIzvjestaj(
  zaposleniId: string,
  evidencije: readonly DnevnaEvidencija[],
  godina: number,
  mjesec: number
): MjesecniIzvjestaj {
  const izvjestajBase: MjesecniIzvjestaj = {
    zaposleniId,
    ukupnoRadnihSati: 0,
    ukupnoPrekovremenih: 0,
    bolovanje_do_60: 0,
    bolovanje_preko_60: 0,
    porodiljsko: 0,
    godisnji: 0,
    slobodni_dan: 0,
    smrtni_slucaj: 0,
    vjereski_praznik: 0,
    drzavni_praznik: 0,
    praznik: 0,
    ukupnoOdsustva: 0
  };

  for (const e of evidencije) {
    const [y, m] = e.datum.split('-').map((s) => Number(s));
    if (e.zaposleniId !== zaposleniId || y !== godina || m !== mjesec + 1) {
      continue;
    }
    izvjestajBase.ukupnoRadnihSati += e.radniSati;
    izvjestajBase.ukupnoPrekovremenih += e.prekovremeni;
    if (e.tipOdsustva) {

      izvjestajBase[e.tipOdsustva] += e.satiOdsustva;
      izvjestajBase.ukupnoOdsustva += e.satiOdsustva;
    }
  }

  return izvjestajBase;
}

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) {
    return fallback;
  }
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ============================================================================
// MAIN PAGE (Next.js client component)
// ============================================================================

export default function EvidencijaRadnihSatiPage(): JSX.Element {
  const [zaposleni, setZaposleni] = useState<Zaposleni[]>([]);
  const [evidencije, setEvidencije] = useState<DnevnaEvidencija[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [activeTab, setActiveTab] = useState<'zaposleni' | 'evidencija' | 'izvjestaj'>('zaposleni');
  const [selectedZaposleni, setSelectedZaposleni] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddZaposleni, setShowAddZaposleni] = useState<boolean>(false);
  const [showAddEvidencija, setShowAddEvidencija] = useState<boolean>(false);

  const [noviZaposleni, setNoviZaposleni] = useState<Partial<Zaposleni>>({
    ime: '',
    prezime: '',
    jmbg: '',
    pozicija: '',
    aktivan: true
  });

  const [novaEvidencija, setNovaEvidencija] = useState<Partial<DnevnaEvidencija>>({
    zaposleniId: '',
    datum: formatDate(new Date()),
    radniSati: 8,
    prekovremeni: 0,
    tipOdsustva: undefined,
    satiOdsustva: 0,
    napomena: ''
  });

  // load
  useEffect(() => {
    const savedZaposleni = safeParse<Zaposleni[]>(
      localStorage.getItem('zaposleni_data'),
      []
    );
    const savedEvidencije = safeParse<DnevnaEvidencija[]>(
      localStorage.getItem('evidencije_data'),
      []
    );
    setZaposleni(savedZaposleni);
    setEvidencije(savedEvidencije);
  }, []);

  // persist zaposleni
  useEffect(() => {
    localStorage.setItem('zaposleni_data', JSON.stringify(zaposleni));
  }, [zaposleni]);

  // persist evidencije
  useEffect(() => {
    localStorage.setItem('evidencije_data', JSON.stringify(evidencije));
  }, [evidencije]);

  // actions
  const dodajZaposlenog = (): void => {
    if (!noviZaposleni.ime || !noviZaposleni.prezime) {
      // simple client-side validation
      // eslint-disable-next-line no-alert
      alert('Ime i prezime su obavezni!');
      return;
    }
    const novi: Zaposleni = {
      id: generateId(),
      ime: noviZaposleni.ime,
      prezime: noviZaposleni.prezime,
      jmbg: noviZaposleni.jmbg ?? '',
      pozicija: noviZaposleni.pozicija ?? '',
      aktivan: true
    };
    setZaposleni((prev) => [...prev, novi]);
    setNoviZaposleni({ ime: '', prezime: '', jmbg: '', pozicija: '', aktivan: true });
    setShowAddZaposleni(false);
  };

  const obrisiZaposlenog = (id: string): void => {
    // eslint-disable-next-line no-restricted-globals, no-alert
    if (!confirm('Da li ste sigurni da želite obrisati ovog zaposlenog?')) {
      return;
    }
    setZaposleni((prev) => prev.filter((z) => z.id !== id));
    setEvidencije((prev) => prev.filter((e) => e.zaposleniId !== id));
    if (selectedZaposleni === id) {
      setSelectedZaposleni('');
    }
  };

  const dodajEvidenciju = (): void => {
    if (!novaEvidencija.zaposleniId) {
      // eslint-disable-next-line no-alert
      alert('Molimo odaberite zaposlenog!');
      return;
    }
    const nova: DnevnaEvidencija = {
      id: generateId(),
      zaposleniId: novaEvidencija.zaposleniId,
      datum: novaEvidencija.datum ?? formatDate(new Date()),
      radniSati: novaEvidencija.radniSati ?? 0,
      prekovremeni: novaEvidencija.prekovremeni ?? 0,
      tipOdsustva: novaEvidencija.tipOdsustva,
      satiOdsustva: novaEvidencija.satiOdsustva ?? 0,
      napomena: novaEvidencija.napomena ?? ''
    };
    setEvidencije((prev) => [...prev, nova]);
    setNovaEvidencija({
      zaposleniId: novaEvidencija.zaposleniId,
      datum: formatDate(new Date()),
      radniSati: 8,
      prekovremeni: 0,
      tipOdsustva: undefined,
      satiOdsustva: 0,
      napomena: ''
    });
    setShowAddEvidencija(false);
  };

  const obrisiEvidenciju = (id: string): void => {
    setEvidencije((prev) => prev.filter((e) => e.id !== id));
  };

  const filteredZaposleni = zaposleni.filter((z) => {
    const q = searchTerm.trim().toLowerCase();
    if (q === '') {
      return true;
    }
    return z.ime.toLowerCase().includes(q) || z.prezime.toLowerCase().includes(q);
  });

  const exportToCSV = (): void => {
    if (zaposleni.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Nema podataka za izvoz.');
      return;
    }
    const rows = zaposleni.map((z) => {
      const izv = izracunajMjesecniIzvjestaj(z.id, evidencije, selectedYear, selectedMonth);
      const obj = {
        Ime: z.ime,
        Prezime: z.prezime,
        'Radni sati': String(izv.ukupnoRadnihSati),
        Prekovremeni: String(izv.ukupnoPrekovremenih),
        'Bolovanje ≤60d': String(izv.bolovanje_do_60),
        'Bolovanje >60d': String(izv.bolovanje_preko_60),
        Porodiljsko: String(izv.porodiljsko),
        Godisnji: String(izv.godisnji),
        'Slobodni dan': String(izv.slobodni_dan),
        'Smrtni slucaj': String(izv.smrtni_slucaj),
        'Vjerski praznik': String(izv.vjereski_praznik),
        'Drzavni praznik': String(izv.drzavni_praznik),
        Praznik: String(izv.praznik),
        'Ukupno odsustva': String(izv.ukupnoOdsustva)
      };
      return obj;
    });

    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')]
      .concat(rows.map((r) => headers.map((h) => `"${(r as Record<string, string>)[h].replace(/"/g, '""')}"`).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evidencija_${MJESECI[selectedMonth]}_${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // UI render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="text-blue-600" size={32} />
                Evidencija Radnih Sati
              </h1>
              <p className="text-gray-600 mt-2">Sistem za praćenje radnog vremena i odsustva zaposlenih</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                aria-label="Izaberi mjesec"
              >
                {MJESECI.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                aria-label="Izaberi godinu"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b">
            <TabButton
              id="zaposleni"
              active={activeTab === 'zaposleni'}
              onClick={() => setActiveTab('zaposleni')}
              icon={<Users size={18} />}
              label="Zaposleni"
            />
            <TabButton
              id="evidencija"
              active={activeTab === 'evidencija'}
              onClick={() => setActiveTab('evidencija')}
              icon={<Calendar size={18} />}
              label="Evidencija"
            />
            <TabButton
              id="izvjestaj"
              active={activeTab === 'izvjestaj'}
              onClick={() => setActiveTab('izvjestaj')}
              icon={<FileText size={18} />}
              label="Izvještaj"
            />
          </div>
        </div>

        {/* tab contents */}
        {activeTab === 'zaposleni' && (
          <ZaposleniTab
            zaposleni={filteredZaposleni}
            noviZaposleni={noviZaposleni}
            setNoviZaposleni={setNoviZaposleni}
            showAdd={showAddZaposleni}
            setShowAdd={setShowAddZaposleni}
            dodajZaposlenog={dodajZaposlenog}
            obrisiZaposlenog={obrisiZaposlenog}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {activeTab === 'evidencija' && (
          <EvidencijaTab
            zaposleni={zaposleni}
            evidencije={evidencije}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedZaposleni={selectedZaposleni}
            setSelectedZaposleni={setSelectedZaposleni}
            showAddEvidencija={showAddEvidencija}
            setShowAddEvidencija={setShowAddEvidencija}
            novaEvidencija={novaEvidencija}
            setNovaEvidencija={setNovaEvidencija}
            dodajEvidenciju={dodajEvidenciju}
            obrisiEvidenciju={obrisiEvidenciju}
          />
        )}

        {activeTab === 'izvjestaj' && (
          <IzvjestajTab
            zaposleni={zaposleni}
            evidencije={evidencije}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            exportToCSV={exportToCSV}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SMALL: TabButton
// ============================================================================

function TabButton(props: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}): JSX.Element {
  const { active, onClick, icon, label } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-4 px-6 font-medium transition-colors ${
        active ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <span className="inline-flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </span>
    </button>
  );
}

// ============================================================================
// TAB: ZaposleniTab
// ============================================================================

function ZaposleniTab(props: {
  zaposleni: Zaposleni[];
  noviZaposleni: Partial<Zaposleni>;
  setNoviZaposleni: (v: Partial<Zaposleni>) => void;
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
  dodajZaposlenog: () => void;
  obrisiZaposlenog: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}): JSX.Element {
  const {
    zaposleni,
    noviZaposleni,
    setNoviZaposleni,
    showAdd,
    setShowAdd,
    dodajZaposlenog,
    obrisiZaposlenog,
    searchTerm,
    setSearchTerm
  } = props;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Lista zaposlenih ({zaposleni.length})</h2>
          <p className="text-sm text-gray-500">Upravljajte zapisima zaposlenih</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              placeholder="Pretraži zaposlene..."
              aria-label="Pretraga zaposlenih"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            <Plus size={16} />
            Dodaj zaposlenog
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              value={noviZaposleni.ime ?? ''}
              onChange={(e) => setNoviZaposleni({ ...noviZaposleni, ime: e.target.value })}
              placeholder="Ime *"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={noviZaposleni.prezime ?? ''}
              onChange={(e) => setNoviZaposleni({ ...noviZaposleni, prezime: e.target.value })}
              placeholder="Prezime *"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={noviZaposleni.jmbg ?? ''}
              onChange={(e) => setNoviZaposleni({ ...noviZaposleni, jmbg: e.target.value })}
              placeholder="JMBG"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={noviZaposleni.pozicija ?? ''}
              onChange={(e) => setNoviZaposleni({ ...noviZaposleni, pozicija: e.target.value })}
              placeholder="Pozicija"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={dodajZaposlenog} className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2">
              <Save size={14} />
              Sačuvaj
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-md">
              Otkaži
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Ime</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Prezime</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">Pozicija</th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">JMBG</th>
              <th className="px-3 py-2 text-center font-medium text-gray-700">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {zaposleni.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  <Users className="mx-auto mb-2 text-gray-300" size={48} />
                  Nema zaposlenih
                </td>
              </tr>
            ) : (
              zaposleni.map((z) => (
                <tr key={z.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{z.ime}</td>
                  <td className="px-3 py-2">{z.prezime}</td>
                  <td className="px-3 py-2">{z.pozicija ?? '-'}</td>
                  <td className="px-3 py-2">{z.jmbg ?? '-'}</td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={() => obrisiZaposlenog(z.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: EvidencijaTab
// ============================================================================

function EvidencijaTab(props: {
  zaposleni: Zaposleni[];
  evidencije: DnevnaEvidencija[];
  selectedYear: number;
  selectedMonth: number;
  selectedZaposleni: string;
  setSelectedZaposleni: (id: string) => void;
  showAddEvidencija: boolean;
  setShowAddEvidencija: (v: boolean) => void;
  novaEvidencija: Partial<DnevnaEvidencija>;
  setNovaEvidencija: (v: Partial<DnevnaEvidencija>) => void;
  dodajEvidenciju: () => void;
  obrisiEvidenciju: (id: string) => void;
}): JSX.Element {
  const {
    zaposleni,
    evidencije,
    selectedYear,
    selectedMonth,
    selectedZaposleni,
    setSelectedZaposleni,
    showAddEvidencija,
    setShowAddEvidencija,
    novaEvidencija,
    setNovaEvidencija,
    dodajEvidenciju,
    obrisiEvidenciju
  } = props;

  const prikazEvidencija = evidencije.filter((e) => {
    const [y, m] = e.datum.split('-').map((s) => Number(s));
    const datumFilter = y === selectedYear && m === selectedMonth + 1;
    const zaposleniFilter = selectedZaposleni ? e.zaposleniId === selectedZaposleni : true;
    return datumFilter && zaposleniFilter;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Dnevna evidencija - {MJESECI[selectedMonth]} {selectedYear}</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedZaposleni}
            onChange={(e) => setSelectedZaposleni(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
            aria-label="Filter zaposlenih"
          >
            <option value="">Svi zaposleni</option>
            {zaposleni.map((z) => (
              <option key={z.id} value={z.id}>
                {z.ime} {z.prezime}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setShowAddEvidencija(!showAddEvidencija)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md">
            <Plus size={16} /> Nova evidencija
          </button>
        </div>
      </div>

      {showAddEvidencija && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <select
              value={novaEvidencija.zaposleniId ?? ''}
              onChange={(e) => setNovaEvidencija({ ...novaEvidencija, zaposleniId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Odaberi zaposlenog *</option>
              {zaposleni.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.ime} {z.prezime}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={novaEvidencija.datum ?? formatDate(new Date())}
              onChange={(e) => setNovaEvidencija({ ...novaEvidencija, datum: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />

            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={String(novaEvidencija.radniSati ?? 8)}
              onChange={(e) => setNovaEvidencija({ ...novaEvidencija, radniSati: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              aria-label="Radni sati"
            />

            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={String(novaEvidencija.prekovremeni ?? 0)}
              onChange={(e) => setNovaEvidencija({ ...novaEvidencija, prekovremeni: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              aria-label="Prekovremeni"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={novaEvidencija.tipOdsustva ?? ''}
              onChange={(e) =>
                setNovaEvidencija({
                  ...novaEvidencija,
                  tipOdsustva: (e.target.value as TipOdsustva) || undefined,
                  // ako izabran tip, podesi default sati odsustva na 8
                  satiOdsustva: e.target.value ? (novaEvidencija.satiOdsustva ?? 8) : 0
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Bez odsustva</option>
              {TIPOVI_ODSUSTVA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={String(novaEvidencija.satiOdsustva ?? 0)}
              onChange={(e) => setNovaEvidencija({ ...novaEvidencija, satiOdsustva: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />

            <input
              type="text"
              value={novaEvidencija.napomena ?? ''}
              onChange={(e) => setNovaEvidencija({ ...novaEvidencija, napomena: e.target.value })}
              placeholder="Napomena"
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={dodajEvidenciju} className="px-4 py-2 bg-green-600 text-white rounded-md">
              Sačuvaj
            </button>
            <button type="button" onClick={() => setShowAddEvidencija(false)} className="px-4 py-2 bg-gray-200 rounded-md">
              Otkaži
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Datum</th>
              <th className="px-3 py-2 text-left">Zaposleni</th>
              <th className="px-3 py-2 text-center">Radni sati</th>
              <th className="px-3 py-2 text-center">Prekovremeni</th>
              <th className="px-3 py-2 text-center">Odsustvo</th>
              <th className="px-3 py-2 text-center">Sati odsustva</th>
              <th className="px-3 py-2 text-left">Napomena</th>
              <th className="px-3 py-2 text-center">Akcije</th>
            </tr>
          </thead>

          <tbody>
            {prikazEvidencija.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  <AlertCircle className="mx-auto mb-2 text-gray-300" size={40} />
                  Nema evidencija za izabrani mjesec / zaposlenog
                </td>
              </tr>
            ) : (
              prikazEvidencija.map((e) => {
                const z = zaposleni.find((zz) => zz.id === e.zaposleniId);
                const tipLabel = e.tipOdsustva ? TIPOVI_ODSUSTVA.find((t) => t.value === e.tipOdsustva)?.label : undefined;
                return (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{e.datum}</td>
                    <td className="px-3 py-2">{z ? `${z.ime} ${z.prezime}` : '-'}</td>
                    <td className="px-3 py-2 text-center">{e.radniSati}</td>
                    <td className="px-3 py-2 text-center">{e.prekovremeni}</td>
                    <td className="px-3 py-2 text-center">{tipLabel ?? '-'}</td>
                    <td className="px-3 py-2 text-center">{e.satiOdsustva ?? '-'}</td>
                    <td className="px-3 py-2">{e.napomena ?? '-'}</td>
                    <td className="px-3 py-2 text-center">
                      <button type="button" onClick={() => obrisiEvidenciju(e.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// TAB: IzvjestajTab
// ============================================================================

function IzvjestajTab(props: {
  zaposleni: Zaposleni[];
  evidencije: DnevnaEvidencija[];
  selectedYear: number;
  selectedMonth: number;
  exportToCSV: () => void;
}): JSX.Element {
  const { zaposleni, evidencije, selectedYear, selectedMonth, exportToCSV } = props;
  const izvjestaji = zaposleni.map((z) => ({
    zaposleni: z,
    izv: izracunajMjesecniIzvjestaj(z.id, evidencije, selectedYear, selectedMonth)
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Mjesečni izvještaj - {MJESECI[selectedMonth]} {selectedYear}</h2>
        <button type="button" onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md">
          <Download size={16} /> Izvezi CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Zaposleni</th>
              <th className="px-2 py-2 text-center">Radni sati</th>
              <th className="px-2 py-2 text-center">Prekovremeni</th>
              <th className="px-2 py-2 text-center">Bol ≤60d</th>
              <th className="px-2 py-2 text-center">Bol {'>'}60d</th>
              <th className="px-2 py-2 text-center">Porodiljsko</th>
              <th className="px-2 py-2 text-center">Godišnji</th>
              <th className="px-2 py-2 text-center">Slobodni</th>
              <th className="px-2 py-2 text-center">Praznici</th>
              <th className="px-2 py-2 text-center">Ukupno odsustva</th>
            </tr>
          </thead>
          <tbody>
            {izvjestaji.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  <AlertCircle className="mx-auto mb-2 text-gray-300" size={40} />
                  Nema zaposlenih za izvještaj
                </td>
              </tr>
            ) : (
              izvjestaji.map(({ zaposleni: z, izv }) => (
                <tr key={z.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">{z.ime} {z.prezime}</td>
                  <td className="px-2 py-2 text-center">{izv.ukupnoRadnihSati}</td>
                  <td className="px-2 py-2 text-center">{izv.ukupnoPrekovremenih}</td>
                  <td className="px-2 py-2 text-center">{izv.bolovanje_do_60}</td>
                  <td className="px-2 py-2 text-center">{izv.bolovanje_preko_60}</td>
                  <td className="px-2 py-2 text-center">{izv.porodiljsko}</td>
                  <td className="px-2 py-2 text-center">{izv.godisnji}</td>
                  <td className="px-2 py-2 text-center">{izv.slobodni_dan}</td>
                  <td className="px-2 py-2 text-center">{izv.vjereski_praznik + izv.drzavni_praznik + izv.praznik}</td>
                  <td className="px-2 py-2 text-center font-semibold">{izv.ukupnoOdsustva}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

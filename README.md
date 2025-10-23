# 🦅 Airport Wildlife Management System - Aerodrom Tivat

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue)
![AI](https://img.shields.io/badge/AI-DeepSeek-orange)

Profesionalni sistem za upravljanje divljim životinjama na Aerodromu Tivat, kompatibilan sa **EASA** i **ICAO** standardima.

---

## 🚀 Glavne Karakteristike

### 📊 Dashboard & Analitika
- **Real-time monitoring** posmatranja divljih životinja
- **AI analiza trendova** - automatski izveštaji za 2, 3, 7 dana, 1, 3, 6 mjeseci i godinu dana
- **Statistike rizika** - procjena opasnosti po zonama aerodroma
- **Interaktivne kartice** - pregled aktivnih opasnosti i zadataka

### 🤖 AI Asistent
- Integrisan **DeepSeek AI** preko OpenRouter platforme
- Specifični savjeti za Aerodrom Tivat i mediteransku klimu
- Analiza rizika po vrstama ptica
- Preporuke za prevenciju u skladu sa EASA/ICAO standardima
- **Dnevni AI izveštaji** - automatski generisani

### 🎵 Audio Repelent Sistem
- Biblioteka repelent zvukova za različite vrste ptica
- **Gunshot repelent** za hitne situacije
- **Auto-repeat funkcionalnost** - zvukovi se ponavljaju dok se ne zaustave
- **Download opcija** - preuzimanje audio fajlova za terensku upotrebu

### 📱 Kompletna Administracija
- **Upravljanje posmatranjima** - evidencija svih wildlife sighting-a
- **Sistem izvještaja** - prijava opasnosti i hazarda
- **Zadaci i planiranje** - dodela i praćenje aktivnosti
- **Poruke i notifikacije** - interni komunikacioni sistem

---

## 🛠 Tehnologije

### Frontend
- **Next.js 15** - React framework sa App Router
- **TypeScript** - Tipizirani JavaScript za bolju produktivnost
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Moderni UI komponenti
- **Lucide React** - Ikone

### Backend & Baza
- **Supabase** - PostgreSQL baza podataka + Auth
- **Next.js API Routes** - Serverless funkcije
- **OpenRouter AI** - DeepSeek AI model za analize

### AI & Integracije
- **DeepSeek Chat** - Besplatni AI model za analize
- **Custom prompt engineering** - Specifično za wildlife management
- **Real-time data analysis** - Analiza historijskih podataka

---

## 📁 Struktura Projekta

```
airport-wildlife-app/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Kontrolna tabla
│   ├── api/              # API rute
│   │   ├── ai/           # AI integracije
│   │   └── ...           # Ostale API rute
│   ├── bird-sounds/      # Audio repelent stranica
│   └── ...
├── components/           # React komponente
│   ├── ui/              # shadcn/ui komponente
│   ├── wildlife-ai-chat-card.tsx    # AI asistent
│   ├── bird-sounds-player.tsx       # Audio repelent
│   └── ...
├── lib/                 # Utility funkcije
│   ├── supabase/        # Supabase klijent
│   └── utils.ts         # Pomoćne funkcije
└── public/
    └── sounds/          # Audio fajlovi za repelente
```

---

## 🚀 Brzo Pokretanje

### Preduslovi
- Node.js 18+
- npm, yarn ili pnpm
- Supabase nalog

### Instalacija

1. **Kloniraj repozitorijum**

```bash
git clone https://github.com/your-username/airport-wildlife-system.git
cd airport-wildlife-system
```

2. **Instaliraj zavisnosti**

```bash
npm install
# ili
yarn install
# ili
pnpm install
```

3. **Podesi environment varijable**

```bash
cp .env.example .env.local
```

Popuni `.env.local` sa tvojim vrednostima:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

4. **Pokreni development server**

```bash
npm run dev
# ili
yarn dev
# ili
pnpm dev
```

Aplikacija će biti dostupna na **http://localhost:3000**

---

## 🗄 Baza Podataka

### Glavne Tabele
- `profiles` - Korisnički profili i uloge
- `wildlife_sightings` - Evidencija posmatranja životinja
- `hazard_reports` - Izvještaji o opasnostima
- `tasks` - Zadaci i aktivnosti
- `activity_plans` - Planiranje sezonskih aktivnosti
- `messages` - Sistem poruka

### Schema Features
- **Row Level Security** - Sigurnosni mehanizmi
- **Real-time subscriptions** - Live ažuriranja
- **Automatski timestamps** - created_at/updated_at
- **Foreign key constraints** - Relacioni integritet

---

## 🤖 AI Integracija

### DeepSeek AI Asistent

```typescript
// Primer AI analize
const analysis = await generateWildlifeAnalysis({
  period: 'last_30_days',
  species: 'gulls',
  location: 'runway_a'
});
```

### Karakteristike AI Sistema
- **Kontekstualno razumevanje** - Specifično za aerodrome
- **Multi-period analiza** - 7 različitih vremenskih perioda
- **Regulatorni compliance** - EASA/ICAO standardi
- **Preventivni savjeti** - Proaktivne mere

---

## 🎵 Audio Repelent Sistem

### Dostupni Zvukovi
| Vrsta | Trajanje | Frekvencija | Efikasnost |
|-------|----------|-------------|------------|
| Galeb | 20s | 2-8 kHz | 85% |
| Lastavica | 22s | 5-12 kHz | 70% |
| Soko | 18s | 8-15 kHz | 65% |
| Golub | 25s | 3-10 kHz | 80% |
| Vrana | 20s | 4-9 kHz | 60% |
| Vrabac | 15s | 6-14 kHz | 90% |
| Gunshot | 5s | Impulsni | 95% |

### Funkcionalnosti
- **Auto-repeat** - Kontinuirano emitovanje
- **Progress tracking** - Vizuelni prikaz reprodukcije
- **Download** - Preuzimanje za terensku upotrebu
- **Safety warnings** - Upozorenja za gunshot zvuk

---

## 👥 Uloge Korisnika

### 🛡️ Officer (Službenik)
- Unos posmatranja životinja
- Prijava opasnosti
- Pregled zadataka

### 👨‍💼 Supervisor (Supervizor)
- Sve privilegije Officera
- Dodela zadataka
- Odobravanje izvještaja
- Pregled statistika

### ⚙️ Admin (Administrator)
- Puna administratorska prava
- Upravljanje korisnicima
- Sistem podešavanja
- Pristup svim podacima

---

## 📈 Production Deploy

### Vercel (Preporučeno)

```bash
npm run build
vercel --prod
```

### Environment Varijable za Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENROUTER_API_KEY=your_production_openrouter_key
NEXTAUTH_URL=https://your-domain.com
```

---

## 🐛 Troubleshooting

### Česti Problemi
- **Supabase konekcija** - Proveri environment varijable
- **AI API greške** - Proveri OpenRouter API key
- **Audio playback** - Proveri putanje audio fajlova
- **Auth greške** - Proveri RLS policies u Supabase

### Logovi i Debug

```bash
# Development sa detaljnim logovima
DEBUG=* npm run dev

# Production build test
npm run build && npm start
```

---

## 🤝 Doprinosi

Doprinosi su dobrodošli! Molimo vas da:

1. Fork-ujte repozitorijum
2. Kreirajte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit-ujte promene (`git commit -m 'Add some AmazingFeature'`)
4. Push-ujte na branch (`git push origin feature/AmazingFeature`)
5. Otvorite Pull Request

---

## 📄 Licenca

Ovaj projekat je licenciran pod **MIT Licencom** - pogledajte [LICENSE](LICENSE) fajl za detalje.

---

## 🆘 Podrška

Za tehničku podršku ili pitanja:

- 📧 Email: support@aerodrom-tivat.me
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/airport-wildlife-system/issues)
- 📚 Dokumentacija: [Wiki](https://github.com/your-username/airport-wildlife-system/wiki)

---

## 🙏 Zahvalnica

- **EASA & ICAO** - Za standarde i smernice
- **Supabase** - Za fantastičnu BaaS platformu
- **DeepSeek** - Za besplatni AI model
- **Next.js Team** - Za izvanredan framework

---

**Napomena:** Ovaj sistem je razvijen za potrebe Aerodroma Tivat i trebalo bi ga prilagoditi specifičnim potrebama drugih aerodroma pre implementacije.

---

Made with ❤️ for aviation safety

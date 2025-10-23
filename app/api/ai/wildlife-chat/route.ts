// app/api/ai/wildlife-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const WILDLIFE_AI_PROMPT = `Ti si stručni AI asistent za upravljanje divljim životinjama na Aerodromu Tivat. Tvoja uloga je:

1. ANALIZA OPASNOSTI: Procjeni rizike od različitih vrsta ptica i životinja
2. PREPORUKE: Daj specifične savjete za smanjenje rizika
3. PREVENTIVA: Predloži mjere prevencije i kontrolne procedure
4. REGULATIVE: Savjetuj u skladu sa EASA i ICAO standardima
5. SEZONSKE SMJERNICE: Obavijesti o sezonskim promjenama ponašanja životinja

SPECIFIČNO ZA AERODROM TIVAT:
- Lokacija: obalno područje, blizina mora
- Sezonske migracije ptica
- Lokalne vrste: galebovi, lastavice, sokoli, etc.
- Vremenski uslovi: mediteranska klima

ODGOVORI NA:
- Identifikaciju vrsta i njihov rizik
- Preporuke za kontrolu životinja
- Hitne procedure za visoko-rizične situacije
- Analizu učestalosti pojavljivanja
- Savjete za poboljšanje bezbjednosti

KORISTI:
- Emoji ikone za bolju preglednost
- Bold tekst za važne informacije
- Liste za preporuke
- Kratke, jasne odgovore`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, sightingData } = await request.json();

    // Pripremi konverzaciju za OpenRouter
    const conversationWithPrompt = [
      {
        role: 'system',
        content: WILDLIFE_AI_PROMPT
      },
      ...messages
    ];

    // Pozovi OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://your-domain.com', // Zamijeni sa tvojim domenom
        'X-Title': 'Airport Wildlife Management System'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat', // Free model na OpenRouter
        messages: conversationWithPrompt,
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        error: errorText
      });
      
      // Fallback na simulirani odgovor ako API ne radi
      const userMessage = messages[messages.length - 1]?.content || '';
      const fallbackResponse = await generateFallbackResponse(userMessage, sightingData);
      
      return NextResponse.json({ 
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }

    const data = await openRouterResponse.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    return NextResponse.json({ 
      content: aiResponse,
      timestamp: new Date().toISOString(),
      model: data.model
    });

  } catch (error) {
    console.error('Wildlife AI chat error:', error);
    
    // Fallback na simulirani odgovor u slučaju greške
    try {
      const { messages } = await request.json();
      const userMessage = messages[messages.length - 1]?.content || '';
      const fallbackResponse = await generateFallbackResponse(userMessage);
      
      return NextResponse.json({ 
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true,
        error: 'Using fallback response'
      });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

// Fallback funkcija ako OpenRouter ne radi
async function generateFallbackResponse(userMessage: string, sightingData?: any) {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('galeb') || lowerMessage.includes('seagull')) {
    return `**Analiza rizika: Galebovi na Aerodromu Tivat**

🦅 **Nivo opasnosti:** VISOK
📊 **Učestalost:** Česta pojava, posebno u jutarnjim satima

**PREPORUKE:**
1. **Kontrola otpada:** Osiguraj hermetičko zatvaranje kontejnera
2. **Habitat modifikacija:** Redovno košenje trave
3. **Odbijajuće metode:** Koristi audio uređaje (pyro akustika)
4. **Monitoring:** Povećaj frekvenci patrola u periodu 06:00-09:00

**SEZONSKA NAPOMENA:** Aktivnost galebova se povećava tokom ljetnih mjeseci (jun-avgust) zbog turističke sezone i veće količine otpada.`;
  }

  if (lowerMessage.includes('lastavica') || lowerMessage.includes('swallow')) {
    return `**Analiza rizika: Lastavice na Aerodromu Tivat**

🦅 **Nivo opasnosti:** SREDNJI
📊 **Učestalost:** Sezonska pojava (april-oktobar)

**PREPORUKE:**
1. **Vremensko planiranje:** Izmjeni raspored letova u sumrak
2. **Nadzor:** Povećaj nadzor u jutarnjim i večernjim satima
3. **Habitat:** Ukloni potencijalna gnijezdilišta u hangarima
4. **Koordinacija:** Obavijesti kontrolu letova o aktivnostima

**MIGRACIONI CIKLUS:** Vrhunac aktivnosti u maju i septembru.`;
  }

  if (lowerMessage.includes('soko') || lowerMessage.includes('falcon')) {
    return `**Analiza rizika: Sokoli na Aerodromu Tivat**

🦅 **Nivo opasnosti:** KRITIČAN
📊 **Učestalost:** Rijetko, ali visok rizik

**HITNE PROCEDURE:**
1. **Trenutno obustavi operacije** u sektoru pojavljivanja
2. **Aktiviraj repelent sisteme**
3. **Obavijesti kontrolu letova**
4. **Pošalji patrolni tim**

**DODATNE MJERE:** Razmotri program kontrolisanog sokolarstva kao dugoročno riešenje.`;
  }

  if (lowerMessage.includes('statistika') || lowerMessage.includes('trend')) {
    return `**Analiza trendova za Aerodrom Tivat**

📈 **SEZONSKI TRENDOVI:**
- **Proleće (mart-maj):** Povećana aktivnost migratornih ptica
- **Leto (jun-avgust):** Visoka aktivnost galebova
- **Jesen (septembar-novembar):** Druga migraciona faza
- **Zima (decembar-februar):** Niska aktivnost, osim u blagim danima

**PREPORUKE ZA POBOLJŠANJE:**
1. **Sezonsko planiranje aktivnosti**
2. **Fokus na jutarnje patroliranje**
3. **Koordinacija sa meteorološkom službom**
4. **Redovna analiza podataka o pojavama**`;
  }

  if (lowerMessage.includes('hitno') || lowerMessage.includes('kritično') || lowerMessage.includes('emergency')) {
    return `🚨 **HITNE PROCEDURE - VISOKI RIZIK**

**ODMAH PREDUZMI:**
1. **Obustavi operacije** u zahvaćenom sektoru
2. **Aktiviraj alarm sistem**
3. **Obavijesti kontrolu letova**
4. **Pošalji hitni patrolni tim**

**DODATNE MJERE:**
- Koristi repelent sisteme (pirotehnika, audio signali)
- Evidentiraj vrstu, lokaciju i broj životinja
- Procijeni trajanje prekida operacija
- Prijavi incident prema standardnim procedurama

**NAKON INCIDENTA:**
- Analiziraj uzrok pojave
- Prilagodi preventivne mjere
- Ažuriraj rizik procjenu`;
  }

  // Generički odgovor
  return `**AI Asistent za Upravljanje Divljim Životinjama - Aerodrom Tivat**

Dobrodošao u sistem nadzora divljih životinja! 🦅✈️

Kako mogu da pomognem danas? Mogu da pružim:

🔍 **Analizu rizika** specifičnih vrsta
📋 **Preporuke za kontrolu** i prevenciju  
📊 **Interpretaciju podataka** i trendova
🚨 **Hitne procedure** za visoko-rizične situacije
📝 **Savjete u skladu sa EASA/ICAO standardima**

Postavi mi pitanje o određenoj vrsti, analizi rizika, ili preporukama za poboljšanje bezbjednosti na aerodromu.`;
}
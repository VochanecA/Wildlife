// app/api/ai/daily-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Uzmi podatke za različite vremenske periode
    const analysisData = await gatherAnalysisData(supabase);
    
    // Generiši AI analizu
    const aiAnalysis = await generateDailyAnalysis(analysisData);

    return NextResponse.json({ 
      analysis: aiAnalysis,
      generated_at: new Date().toISOString(),
      periods: ['2_dana', '3_dana', '7_dana', '1_mjesec', '3_mjeseca', '6_mjeseci', '1_godina']
    });

  } catch (error) {
    console.error('Daily analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function gatherAnalysisData(supabase: any) {
  const now = new Date();
  
  // Definiši vremenske periode
  const periods = {
    last_2_days: new Date(now.setDate(now.getDate() - 2)),
    last_3_days: new Date(now.setDate(now.getDate() - 3)),
    last_7_days: new Date(now.setDate(now.getDate() - 7)),
    last_30_days: new Date(now.setDate(now.getDate() - 30)),
    last_90_days: new Date(now.setDate(now.getDate() - 90)),
    last_180_days: new Date(now.setDate(now.getDate() - 180)),
    last_365_days: new Date(now.setDate(now.getDate() - 365)),
  };

  const analysisData: any = {};

  // Prikupi podatke za svaki period
  for (const [periodName, startDate] of Object.entries(periods)) {
    // Wildlife sightings za period
    const { data: sightings, error: sightingsError } = await supabase
      .from('wildlife_sightings')
      .select('*')
      .gte('created_at', startDate.toISOString());

    // Hazard reports za period
    const { data: hazards, error: hazardsError } = await supabase
      .from('hazard_reports')
      .select('*')
      .gte('created_at', startDate.toISOString());

    // Tasks za period
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .gte('created_at', startDate.toISOString());

    analysisData[periodName] = {
      sightings: sightings || [],
      hazards: hazards || [],
      tasks: tasks || [],
      period: periodName.replace('_', ' '),
      start_date: startDate.toISOString()
    };
  }

  return analysisData;
}

async function generateDailyAnalysis(analysisData: any) {
  // Pripremi podatke za AI analizu
  const analysisPrompt = createAnalysisPrompt(analysisData);

  // Pozovi OpenRouter API za analizu
  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://your-domain.com',
      'X-Title': 'Airport Wildlife Management - Daily Analysis'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `Ti si stručni analitičar za upravljanje divljim životinjama na aerodromima. 
          Analiziraj podatke i pruži detaljne uvide o trendovima, rizicima i preporukama.
          Koristi konkretne brojke i procente. Budi specifičan za Aerodrom Tivat.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
    })
  });

  if (!openRouterResponse.ok) {
    // Fallback analiza ako API ne radi
    return generateFallbackAnalysis(analysisData);
  }

  const data = await openRouterResponse.json();
  return data.choices[0]?.message?.content || 'Nema dostupne analize.';
}

function createAnalysisPrompt(analysisData: any) {
  let prompt = `DNEVNI IZVEŠTAJ - ANALIZA PODATAKA AERODROM TIVAT\n\n`;
  
  // Dodaj podatke za svaki period
  for (const [periodName, data] of Object.entries(analysisData)) {
    const periodData = data as any;
    
    prompt += `=== PERIOD: ${periodData.period.toUpperCase()} ===\n`;
    prompt += `Posmatranja životinja: ${periodData.sightings.length}\n`;
    prompt += `Prijavljeni hazardi: ${periodData.hazards.length}\n`;
    prompt += `Zadaci: ${periodData.tasks.length}\n\n`;
    
    // Analiza wildlife sightings
    if (periodData.sightings.length > 0) {
      const speciesCount: any = {};
      const severityCount: any = {};
      
      periodData.sightings.forEach((sighting: any) => {
        speciesCount[sighting.species] = (speciesCount[sighting.species] || 0) + 1;
        severityCount[sighting.severity] = (severityCount[sighting.severity] || 0) + 1;
      });
      
      prompt += `Najčešće vrste: ${Object.entries(speciesCount)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map(([species, count]) => `${species} (${count})`)
        .join(', ')}\n`;
      
      prompt += `Nivoi rizika: ${Object.entries(severityCount)
        .map(([severity, count]) => `${severity}: ${count}`)
        .join(', ')}\n`;
    }
    
    prompt += '\n';
  }
  
  prompt += `ANALIZIRAJ OVE PODATKE I DAJ:
  1. TRENDOVI POJAVLJIVANJA - Kako se mijenja aktivnost životinja tokom vremena?
  2. SEZONSKE PROMJENE - Koje vrste su najaktivnije u kojim periodima?
  3. RIZIK PROCJENA - Koji su kĺjučni rizici za bezbjednost letova?
  4. PREPORUKE - Šta treba uraditi da se smanji rizik?
  5. PREDIKCIJE - Šta očekivati u narednom periodu?
  
  Budi specifičan za Aerodrom Tivat i mediteransku klimu.`;
  
  return prompt;
}

function generateFallbackAnalysis(analysisData: any) {
  // Jednostavna fallback analiza
  const latestData = analysisData.last_7_days;
  const monthlyData = analysisData.last_30_days;
  
  return `**DNEVNI ANALITIČKI IZVEŠTAJ - AERODROM TIVAT**
  
📊 **PREGLED AKTIVNOSTI (Zadnjih 7 dana)**
- Posmatranja životinja: ${latestData.sightings.length}
- Prijavljeni hazardi: ${latestData.hazards.length}
- Aktivni zadaci: ${latestData.tasks.length}

🦅 **TRENDOVI POJAVLJIVANJA**
U poslednjih 30 dana zabeleženo ${monthlyData.sightings.length} posmatranja.
Analiza pokazuje ${monthlyData.sightings.length > 20 ? 'povećanu' : 'stabilnu'} aktivnost divljih životinja.

⚠️ **PREPORUKE ZA SMANJENJE RIZIKA**
1. Povećaj frekvenciju patrola u jutarnjim satima
2. Proveri stanje repelent sistema
3. Analiziraj uzorke pojavljivanja po lokacijama

🔮 **PREDIKCIJA ZA NAREDNI PERIOD**
Očekuje se ${monthlyData.sightings.length > 20 ? 'nastavak povećane' : 'stabilna'} aktivnost.
Preporučuje se posebna pažnja na ${getCurrentSeason()} sezonske migracije.`;
}

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'prolećne';
  if (month >= 6 && month <= 8) return 'letnje';
  if (month >= 9 && month <= 11) return 'jesenje';
  return 'zimske';
}
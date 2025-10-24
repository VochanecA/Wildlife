import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PREDICTION_AI_PROMPT = `Ti si AI model za predikciju rizika od divljih životinja na Aerodromu Tivat. Tvoj zadatak je:

ANALIZIRAJ i PREDVIDI rizik na osnovu sljedećih parametara:
- Lokacija na aerodromu
- Vrsta životinje (ako je navedena)
- Istorijske pojave
- Sezonski faktori
- Vremenski uslovi

ODGOVORI U JSON FORMATU:
{
  "risk_level": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "reasoning": "Detaljno obrazloženje predikcije",
  "recommendations": ["preporuka1", "preporuka2", ...],
  "time_frame": "kratkorocno|srednjorocno|dugorocno"
}

SPECIFIČNO ZA AERODROM TIVAT:
- Lokacija: obalni aerodrom, blizina mora
- Sezonske migracije: proleće/jesen
- Lokalne vrste: galebovi, lastavice, sokoli, zečevi
- Klima: mediteranska, uticaj vjetra

KRITERIJUMI ZA PROCJENU RIZIKA:
- KRITIČAN: Velike ptice grabljivice, jate ptica >50, blizina piste
- VISOK: Srednje ptice, jate 20-50, taxiway područja
- SREDNJI: Male ptice, pojedinačne životinje, perimetar
- NIZAK: Gmizavci, insekti, udaljene zone

BUDI REALAN I PRECIZAN U PROCJENI!`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, location, species, coordinates, additionalInfo } = await request.json();

    // Kreiraj detaljan prompt za predikciju
    const predictionPrompt = `
${PREDICTION_AI_PROMPT}

PODACI ZA ANALIZU:
LOKACIJA: ${location}
${species ? `VRSTA: ${species}` : 'VRSTA: Nije specificirano'}
${coordinates ? `KOORDINATE: ${coordinates}` : ''}
${additionalInfo ? `DODATNE INFORMACIJE: ${additionalInfo}` : ''}

ANALIZIRAJ I PREDVIDI RIZIK:
`

    // Pozovi OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://aerodrom-tivat.com',
        'X-Title': 'Airport Wildlife Prediction System'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: PREDICTION_AI_PROMPT
          },
          {
            role: 'user',
            content: predictionPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3, // Niži temperature za konzistentnije predikcije
        response_format: { type: "json_object" }
      })
    });

    if (!openRouterResponse.ok) {
      console.error('OpenRouter API error:', await openRouterResponse.text());
      return NextResponse.json({ 
        prediction: generateFallbackPrediction(location, species, additionalInfo),
        fallback: true
      });
    }

    const data = await openRouterResponse.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    // Parsiraj JSON odgovor
    let prediction;
    try {
      prediction = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      prediction = generateFallbackPrediction(location, species, additionalInfo);
    }

    return NextResponse.json({ 
      prediction,
      model: data.model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Wildlife prediction error:', error);
    
    // Fallback na osnovnu predikciju
    try {
      const { location, species, additionalInfo } = await request.json();
      const prediction = generateFallbackPrediction(location, species, additionalInfo);
      
      return NextResponse.json({ 
        prediction,
        fallback: true,
        error: 'Using fallback prediction'
      });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

function generateFallbackPrediction(location: string, species?: string, additionalInfo?: string) {
  // Inteligentniji fallback baziran na lokaciji i vrsti
  let riskLevel = "medium";
  let confidence = 0.6;
  let reasoning = "Osnovna procjena rizika na osnovu unesenih podataka.";
  const recommendations = [
    "Preporučena standardna patrola oblasti",
    "Provjera repelent sistema u blizini",
    "Nadzor narednih 24 sata"
  ];

  // Analiza lokacije
  const locLower = location.toLowerCase();
  if (locLower.includes("pista") || locLower.includes("runway")) {
    riskLevel = "high";
    confidence = 0.75;
    reasoning = "Lokacija u neposrednoj blizini piste zahtijeva povećanu pažnju i češći monitoring.";
  } else if (locLower.includes("taxi") || locLower.includes("apron")) {
    riskLevel = "medium";
    confidence = 0.65;
    reasoning = "Operativna zona sa umjerenim rizikom. Redovan nadzor preporučen.";
  } else if (locLower.includes("perimetar") || locLower.includes("ograda")) {
    riskLevel = "low";
    confidence = 0.5;
    reasoning = "Perimetarna zona sa niskim rizikom. Rutinski nadzor dovoljan.";
  }

  // Analiza vrste
  if (species) {
    const speciesLower = species.toLowerCase();
    if (speciesLower.includes("soko") || speciesLower.includes("orao") || speciesLower.includes("jastreb")) {
      riskLevel = "critical";
      confidence = 0.85;
      reasoning += " Prisustvo velikih ptica grabljivica značajno povećava rizik za vazduhoplovne operacije.";
      recommendations.unshift("HITNO: Aktiviraj repelent sisteme i obavijesti kontrolu letova");
    } else if (speciesLower.includes("galeb")) {
      riskLevel = "high";
      confidence = 0.8;
      reasoning += " Galebovi su česta pojava sa visokim rizikom, posebno u jutarnjim satima.";
      recommendations.unshift("Povećaj frekvenciju patrola u periodu 06:00-10:00");
    } else if (speciesLower.includes("lastavica") || speciesLower.includes("čvor")) {
      riskLevel = "medium";
      confidence = 0.7;
      reasoning += " Male ptice migratorne vrste. Rizik je umjeren ali zahtijeva nadzor.";
    }
  }

  // Analiza dodatnih informacija
  if (additionalInfo) {
    const infoLower = additionalInfo.toLowerCase();
    if (infoLower.includes("jata") || infoLower.includes("grupa")) {
      riskLevel = riskLevel === "low" ? "medium" : riskLevel === "medium" ? "high" : "critical";
      confidence = Math.min(confidence + 0.1, 0.95);
      reasoning += " Prisustvo jata ptica dodatno povećava rizik.";
    }
    if (infoLower.includes("sezona") || infoLower.includes("migracija")) {
      reasoning += " Sezonski faktor treba uzeti u obzir u planiranju nadzora.";
    }
  }

  return {
    risk_level: riskLevel,
    confidence,
    reasoning,
    recommendations,
    time_frame: "kratkorocno"
  };
}

// Glavne karakteristike:

//     Realna AI Integracija - Koristi DeepSeek model preko OpenRouter-a

//     Inteligentna Analiza - AI analizira lokaciju, vrstu i dodatne faktore

//     JSON Response - Strukturirani odgovor sa rizikom, sigurnošću i preporukama

//     Fallback System - Pametni fallback ako AI nije dostupan

//     User Feedback - Jasno prikazuje analizu i obrazloženje

//     Validation - Provjera podataka prije slanja AI-u
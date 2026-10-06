import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { DecisionProfile } from '@/lib/decision-model-store';

interface CompileRequest {
  prompt: string;
  currentProfile?: DecisionProfile;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CompileRequest;
    const { prompt, currentProfile } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt de política es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `
Eres el Compilador de Políticas de Crédito de Lucas para la institución financiera "Apoyando Ideas".
Tu trabajo es recibir una política de crédito explicada en lenguaje natural y convertirla en una estructura JSON estricta de reglas cuantitativas, knockouts eliminatorios, garantías y directrices de razonamiento.

Formato JSON esperado (SOLO JSON, sin explicaciones):
{
  "nombre": "Nombre descriptivo del modelo de crédito",
  "sector": "Sector económico objetivo",
  "descripcion": "Breve descripción ejecutiva",
  "filtrosEliminatorios": {
    "satOpinionPositiva": boolean,
    "sinListasNegras69B": boolean,
    "antiguedadMinimaMeses": number,
    "maxDiasAtrasoBuro": number
  },
  "umbralesCuantitativos": {
    "maxDtiRatio": number (porcentaje 10-50, por ejemplo 25),
    "maxClientConcentration": number (porcentaje 15-60, por ejemplo 35),
    "minMonthlyCfdi": number (facturas mensuales mínimas, por ejemplo 15),
    "minFacturacionAnual": number (en MXN, por ejemplo 6000000),
    "plazoMaximoMeses": number (meses, por ejemplo 24)
  },
  "politicaGarantias": {
    "montoRequiereAval": number (en MXN, por ejemplo 2000000),
    "tipoGarantiaSugerida": string,
    "aforoFactoraje": string,
    "requiereObligadoSolidario": boolean
  },
  "directricesIA": [
    "string con directriz 1",
    "string con directriz 2",
    "string con directriz 3"
  ]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return NextResponse.json({ compiled: parsed });
        }
      } catch (geminiError) {
        console.warn('Gemini compile failed, using deterministic compiler fallback:', geminiError);
      }
    }

    // Deterministic Rule Compiler Fallback
    const compiled = fallbackCompilePolicy(prompt, currentProfile);
    return NextResponse.json({ compiled });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al compilar política';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function fallbackCompilePolicy(prompt: string, currentProfile?: DecisionProfile) {
  const p = prompt.toLowerCase();

  // Extract DTI percentage (e.g. "no supere el 20%", "máximo 25%", "25% de la facturación")
  const dtiMatch = p.match(/(?:máximo|max|supere|tope|límite)?\s*(\d{1,2})\s*%\s*(?:de\s*(?:la\s*)?(?:facturación|ventas|ingresos))?/i);
  const maxDtiRatio = dtiMatch ? Math.min(Math.max(parseInt(dtiMatch[1], 10), 10), 45) : currentProfile?.umbralesCuantitativos.maxDtiRatio || 25;

  // Extract Concentration percentage (e.g. "concentración menor al 30%", "ningún cliente más del 35%")
  const concMatch = p.match(/(?:cliente|concentración|dependencia)[^\d%]{0,35}(\d{1,2})\s*%/i);
  const maxClientConcentration = concMatch ? Math.min(Math.max(parseInt(concMatch[1], 10), 15), 55) : currentProfile?.umbralesCuantitativos.maxClientConcentration || 35;

  // Extract Min Monthly CFDIs
  const cfdiMatch = p.match(/(\d{1,3})\s*(?:facturas|cfdis?)\s*(?:al\s*mes|mensuales)/i);
  const minMonthlyCfdi = cfdiMatch ? parseInt(cfdiMatch[1], 10) : currentProfile?.umbralesCuantitativos.minMonthlyCfdi || 15;

  // Extract Aval threshold (e.g. "mayores a $2,000,000", "2 millones")
  let montoRequiereAval = currentProfile?.politicaGarantias.montoRequiereAval || 2000000;
  if (p.includes('3 millones') || p.includes('3,000,000') || p.includes('3 mdp') || p.includes('$3m')) {
    montoRequiereAval = 3000000;
  } else if (p.includes('1 millón') || p.includes('1,000,000') || p.includes('1 mdp') || p.includes('$1m')) {
    montoRequiereAval = 1000000;
  } else if (p.includes('2 millones') || p.includes('2,000,000') || p.includes('2 mdp') || p.includes('$2m')) {
    montoRequiereAval = 2000000;
  }

  // Extract Sector/Title keywords
  let nombre = currentProfile?.nombre || 'Modelo de Crédito PyME Personalizado';
  let sector = currentProfile?.sector || 'Comercio y Servicios';

  if (p.includes('transporte') || p.includes('flete') || p.includes('logística')) {
    nombre = 'Modelo PyME Transporte & Carga';
    sector = 'Transporte y Logística Pesada';
  } else if (p.includes('comercio') || p.includes('distribui') || p.includes('mayorista')) {
    nombre = 'Modelo Distribución & Comercio Mayorista';
    sector = 'Comercio al por Mayor';
  } else if (p.includes('construc') || p.includes('obra') || p.includes('inmobiliari')) {
    nombre = 'Modelo Construcción & Proveeduría de Obra';
    sector = 'Construcción e Infraestructura';
  } else if (p.includes('agrícola') || p.includes('agro') || p.includes('campo')) {
    nombre = 'Modelo Agroindustria & Granos';
    sector = 'Agropecuario e Industrial';
  } else if (p.includes('tecnolog') || p.includes('software') || p.includes('saas')) {
    nombre = 'Modelo Empresas de Servicios & Tecnología';
    sector = 'Servicios Tecnológicos y Profesionales';
  }

  return {
    nombre,
    sector,
    descripcion: `Política de crédito de Apoyando Ideas orientada a ${sector.toLowerCase()}, con límite DTI del ${maxDtiRatio}% y tope de concentración de clientes al ${maxClientConcentration}%.`,
    filtrosEliminatorios: {
      satOpinionPositiva: !p.includes('ignorar 32-d') && !p.includes('sin opinión sat'),
      sinListasNegras69B: !p.includes('permitir efos'),
      antiguedadMinimaMeses: p.includes('3 años') ? 36 : p.includes('1 año') ? 12 : 24,
      maxDiasAtrasoBuro: p.includes('60 días') ? 60 : 30,
    },
    umbralesCuantitativos: {
      maxDtiRatio,
      maxClientConcentration,
      minMonthlyCfdi,
      minFacturacionAnual: maxDtiRatio <= 20 ? 8000000 : 5000000,
      plazoMaximoMeses: p.includes('12 meses') ? 12 : p.includes('36 meses') ? 36 : 24,
    },
    politicaGarantias: {
      montoRequiereAval,
      tipoGarantiaSugerida: p.includes('prendaria')
        ? 'Garantía Mobiliaria / Activos'
        : p.includes('hipotec')
        ? 'Garantía Hipotecaria'
        : 'Obligado Solidario (Representante Legal)',
      aforoFactoraje: p.includes('1.3') ? '1.3 a 1' : '1.2 a 1',
      requiereObligadoSolidario: !p.includes('sin aval'),
    },
    directricesIA: [
      `Validar que el monto solicitado no exceda el ${maxDtiRatio}% de la facturación anual comprobada en el SAT.`,
      `Verificar que el cliente principal no rebase el ${maxClientConcentration}% de los ingresos totales.`,
      `Confirmar un promedio de al menos ${minMonthlyCfdi} facturas mensuales para validar consistencia operativa.`,
      montoRequiereAval > 0
        ? `Exigir obligado solidario o aval ratificado si la línea solicitada supera los $${(montoRequiereAval / 1000000).toFixed(1)}M MXN.`
        : 'Evaluar crédito sin requisito forzoso de aval.',
    ],
  };
}

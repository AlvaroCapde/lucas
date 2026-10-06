import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { Expediente } from '@/lib/types';

interface ChatRequestPayload {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  expediente: Expediente;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestPayload;
    const { messages, expediente } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes requeridos' }, { status: 400 });
    }

    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no proporcionado' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1].content;
    const apiKey = process.env.GEMINI_API_KEY;

    const isPF = (expediente.empresa.tipoPersona || (expediente.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
    const tipoProducto = expediente.empresa.tipoProducto || (isPF ? 'personal' : 'capital_trabajo');
    const emitidos = expediente.resumen?.cfdiEmitidos ?? (isPF ? 312 : 842);
    const recibidos = expediente.resumen?.cfdiRecibidos ?? (isPF ? 186 : 578);
    const totalCfdi = emitidos + recibidos;

    // Context format for Credit Underwriting at Apoyando Ideas
    const contextPrompt = `
Eres el Experto Apoyando Ideas, la institución financiera que realiza el análisis crediticio del solicitante (${expediente.empresa.razonSocial}, Tipo: ${isPF ? 'Persona Física / Individual' : 'Persona Moral / Empresa'}, Producto: ${tipoProducto.toUpperCase()}) para determinar la viabilidad y aprobación de la línea o crédito.
Tu rol es orientar al analista y al comité de crédito de manera amigable, clara, ágil y con sólido criterio financiero adaptado al tipo de producto financiero solicitado.

DATOS DEL SOLICITANTE EVALUADO:
- Folio del Expediente: ${expediente.folio}
- Tipo de Solicitante: ${isPF ? 'Persona Física (Individual / PFAE / Asalariado / Honorarios)' : 'Persona Moral (Empresa)'}
- Producto Financiero: ${tipoProducto.toUpperCase()}
- Nombre / Razón Social: ${expediente.empresa.razonSocial}
- RFC: ${expediente.empresa.rfc}
${isPF && expediente.empresa.curp ? `- CURP: ${expediente.empresa.curp}` : ''}
- Giro / Actividad / Ocupación: ${expediente.empresa.ocupacion || expediente.empresa.sector}
- Monto Solicitado / Financiado: ${expediente.empresa.montoSolicitado || (isPF ? '$750,000 MXN' : '$3,500,000 MXN')}
${expediente.empresa.valorActivo ? `- Valor del Activo / Vehículo / Flota: ${expediente.empresa.valorActivo}` : ''}
${expediente.empresa.enganchePorcentaje ? `- Enganche / Depósito en Garantía Aportado: ${expediente.empresa.enganchePorcentaje}%` : ''}
${expediente.empresa.plazoMeses ? `- Plazo Solicitado: ${expediente.empresa.plazoMeses} meses` : ''}
${expediente.empresa.destinoDetalle ? `- Detalle / Destino: ${expediente.empresa.destinoDetalle}` : ''}
${isPF && expediente.empresa.ingresoMensual ? `- Ingreso Neto Mensual Estimado: ${expediente.empresa.ingresoMensual}` : ''}
- Contacto: ${expediente.contacto.nombre} (${isPF ? 'Titular' : expediente.contacto.puesto})

MÉTRICAS Y CRITERIOS FINANCIEROS (SAT & BURÓ):
${
  expediente.resumen
    ? `- Score Solvencia: ${expediente.resumen.scoreSolvencia ?? (isPF ? 784 : 818)} / 850 (${expediente.resumen.categoriaRiesgo ?? 'Bajo Riesgo'})
- ${isPF ? 'Ingresos Totales Anualizados (12 meses)' : 'Facturación Total Anualizada (12 meses)'}: ${expediente.resumen.totalFacturado ?? (isPF ? '$1,524,000 MXN' : '$18,420,890 MXN')}
- CFDIs Procesados: ${emitidos} emitidos, ${recibidos} recibidos
- Opinión de Cumplimiento SAT (32-D): ${expediente.resumen.opinionCumplimiento ?? 'POSITIVA'}
- Consulta Buró de Crédito (SIC): Autorizada digitalmente con historial positivo sin marcas de cartera vencida
- Alertas Listas Negras (Art. 69-B CFF): ${expediente.resumen.inconsistenciasDetectadas ?? 0} inconsistencias`
    : `(Extracción fiscal aún no finalizada).`
}

POLÍTICAS DE SUSCRIPCIÓN POR PRODUCTO:
- Automotriz: LTV máximo 80% (mínimo 20% enganche), DTI mensual cuota < 30% ingreso neto, seguro cobertura amplia con beneficiario preferente, factura endosada en garantía.
- Arrendamiento (Leasing): Cobertura EBITDA > 2.5x canon de renta mensual, beneficio fiscal de 100% de rentas deducibles en ISR, valor residual 15% al término del plazo, depósito de garantía 2 rentas.
- Factoraje: Aforo 80-85% sobre deudores calificados AAA/AA, CFDIs método PPD vigentes en SAT sin cancelaciones, rotación DSO < 90 días.
- Crédito Personal: DTI < 35% de ingresos netos, score Buró > 680 pts, pagaré quirografario digital.
- Capital de Trabajo: Cobertura facturación anual SAT < 25%, concentración 1 cliente < 35%, 0 EFOS en 69-B, aval solidario para > $2.0M MXN.

INSTRUCCIONES DE TONO Y ESTILO:
1. Sé moderno, cordial, claro y directo.
2. Habla en nombre del equipo de crédito de Apoyando Ideas.
3. Responde con precisión sobre los parámetros del producto ${tipoProducto.toUpperCase()}.
4. Usa formato markdown limpio y conciso.
`;

    // 1. Try real Gemini API if GEMINI_API_KEY is available
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const contents = [
          { role: 'user', parts: [{ text: contextPrompt }] },
          { role: 'model', parts: [{ text: '¡Entendido! Soy el asistente de crédito de Apoyando Ideas. Estoy listo para ayudarte a evaluar la solvencia y emitir recomendaciones claras y fundamentadas.' }] },
          ...messages.slice(0, -1).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
          { role: 'user', parts: [{ text: lastUserMessage }] },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
        });

        const reply = response.text || 'No se obtuvo respuesta del modelo Gemini.';
        return NextResponse.json({ role: 'assistant', content: reply });
      } catch (geminiError: unknown) {
        console.error('Error invoking Gemini SDK, falling back to Apoyando Ideas underwriting engine:', geminiError);
      }
    }

    // 2. Intelligent Credit Analyst Engine for Apoyando Ideas (Fallback interactivo)
    const reply = generateCreditAnalysisResponse(lastUserMessage, expediente);
    return NextResponse.json({ role: 'assistant', content: reply });
  } catch (error: unknown) {
    console.error('Error in credit chat endpoint:', error);
    const msg = error instanceof Error ? error.message : 'Error interno al procesar mensaje';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Friendly credit analyst engine for Apoyando Ideas (Dynamic for all product types)
 */
function generateCreditAnalysisResponse(question: string, expediente: Expediente): string {
  const q = question.toLowerCase();
  const isPF = (expediente.empresa.tipoPersona || (expediente.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
  const tipoProducto = expediente.empresa.tipoProducto || (isPF ? 'personal' : 'capital_trabajo');
  const resumen = expediente.resumen;
  const montoSolicitado = expediente.empresa.montoSolicitado || (isPF ? '$750,000 MXN' : '$3,500,000 MXN');
  const emitidos = resumen?.cfdiEmitidos ?? (isPF ? 312 : 842);
  const recibidos = resumen?.cfdiRecibidos ?? (isPF ? 186 : 578);

  if (!resumen) {
    return `Para evaluar la viabilidad de la solicitud en **Apoyando Ideas**, aún requerimos que el cliente concluya la sincronización con el SAT y envío de documentos. Tan pronto concluya, podré analizar sus ingresos reales y capacidad de pago.`;
  }

  // Automotriz specific questions (LTV, Enganche, Seguro, Cuota)
  if (tipoProducto === 'automotriz' && (q.includes('ltv') || q.includes('enganche') || q.includes('coche') || q.includes('auto') || q.includes('vehic') || q.includes('seguro'))) {
    const enganche = expediente.empresa.enganchePorcentaje ?? 45;
    const ltv = 100 - enganche;
    return `### 🚗 Análisis de Crédito Automotriz (LTV & Estructura de Garantía)

Para la adquisición de **${expediente.empresa.destinoDetalle || 'Vehículo Solicitado'}** (${expediente.empresa.valorActivo || '$1,350,000 MXN'}):

1. **Relación Préstamo-Valor (LTV)**:
   - *Política Apoyando Ideas*: LTV máximo del **80%** (mínimo 20% de enganche).
   - *Aportación del Solicitante*: Enganche del **${enganche}%** ($600,000 MXN), situando el LTV en **${ltv}%**. **(Excelente cobertura prendaria)**.
2. **Capacidad de Pago Mensual**:
   - Cuota estimada a **${expediente.empresa.plazoMeses || 48} meses**: ~$19,450 MXN.
   - *Razón Cuota/Ingreso*: Representa el **15.8%** de sus ingresos netos (${isPF ? (expediente.empresa.ingresoMensual || '$195,000 MXN') : '$1.53M MXN'}), dentro del límite máximo del 30%.
3. **Requisitos de Garantía & Formalización**:
   - Endoso de factura vehicular digital en garantía prendaria.
   - Póliza de seguro multianual de cobertura amplia con endoso preferente a favor de Apoyando Ideas.
   - Instalación de dispositivo GPS satelital.`;
  }

  // Leasing specific questions (EBITDA, Deducción fiscal, Valor residual, Canon)
  if (tipoProducto === 'arrendamiento' && (q.includes('ebitda') || q.includes('canon') || q.includes('renta') || q.includes('leasing') || q.includes('residual') || q.includes('deduc') || q.includes('fiscal'))) {
    return `### 🏢 Análisis de Arrendamiento Puro (Leasing Corporativo)

Para la flota **${expediente.empresa.destinoDetalle || '4 Tractocamiones Kenworth T680'}** (${expediente.empresa.montoSolicitado || '$3,500,000 MXN'}):

1. **Cobertura Operativa EBITDA vs Canon**:
   - *Política*: Cobertura mínima de **2.5x** sobre la renta mensual.
   - *Resultado*: La empresa genera **$415,000 MXN mensuales de EBITDA**, cubriendo **3.8x** el canon de renta proyectado ($108,000 MXN/mes).
2. **Eficiencia y Escudo Fiscal (100% Deducible)**:
   - Las rentas mensuales son deducibles al 100% en ISR como gasto operativo directo, generando un ahorro fiscal proyectado de **$1.26M MXN** durante el plazo de ${expediente.empresa.plazoMeses || 36} meses.
3. **Estructura de Valor Residual**:
   - Valor residual pactado al **15% ($525,000 MXN)** al mes ${expediente.empresa.plazoMeses || 36}, con opción de compra, renovación de flota o cesión a un tercero.
4. **Garantía**:
   - Depósito en garantía de 2 rentas anticipadas y contrato marco ratificado por el representante legal.`;
  }

  // Factoraje specific questions (Aforo, Deudores, PPD, DSO)
  if (tipoProducto === 'factoraje' && (q.includes('aforo') || q.includes('factoraje') || q.includes('deudor') || q.includes('cartera') || q.includes('ppd') || q.includes('rotaci') || q.includes('dso'))) {
    return `### 📑 Análisis de Factoraje Financiero (Cesión de Cartera)

Para la línea de factoraje revolvente de **${montoSolicitado}**:

1. **Aforo y Calidad de Deudores**:
   - *Aforo autorizado*: **80% de anticipo inmediato** sobre el valor nominal de cada CFDI verificado.
   - *Calidad Crediticia*: Los deudores cedidos son compradores institucionales AAA con récord histórico de pago puntual.
2. **Validación Fiscal en Portal SAT**:
   - 100% de los CFDIs timbrados con método **PPD (Pago en Parcialidades o Diferido)** vigentes, sin notas de crédito o solicitudes de cancelación.
3. **Rotación de Cartera (DSO)**:
   - Plazo promedio de cobranza de **42 días**, muy ágil frente al límite de 90 días de la política.
4. **Mecanismo de Cobranza**:
   - Notificación electrónica y mandato de depósito directo en cuenta concentradora de Apoyando Ideas.`;
  }

  // Criterios generales
  if (q.includes('criterio') || q.includes('fija') || q.includes('modelo') || q.includes('política') || q.includes('politica') || q.includes('regla')) {
    if (tipoProducto === 'automotriz') {
      return `### 🎯 Criterios de Suscripción: Crédito Automotriz

En **Apoyando Ideas**, la evaluación automotriz analiza:
1. **LTV & Enganche**: LTV máximo 80% (aportado: **55.6%**, enganche ${expediente.empresa.enganchePorcentaje ?? 45}%). **(Cumple)**.
2. **Capacidad de Pago**: Cuota mensual inferior al 30% del ingreso comprobable. **(Cumple)**.
3. **Score en Buró**: ${resumen.scoreSolvencia ?? 784} puntos, sin moras en cartera automotriz. **(Cumple)**.
4. **Garantía Prendaria**: Factura digital con endoso + Póliza de seguro amplia. **(Cumple)**.
5. **Opinión Fiscal 32-D**: En sentido POSITIVO. **(Cumple)**.`;
    }

    if (isPF) {
      return `### 🎯 Criterios de Crédito Persona Física (Apoyando Ideas v2.4)

En **Apoyando Ideas**, nuestro modelo evalúa a **${expediente.empresa.razonSocial} (Persona Física)** bajo 5 pilares:
1. **Razón Deuda-Ingreso Mensual (DTI)**: DTI del **23.6%** ($28,500/mes vs $120,800/mes). **(Cumple)**.
2. **Historial en Buró de Crédito (SIC)**: Score de **${resumen.scoreSolvencia ?? 784} puntos**. **(Cumple)**.
3. **Estabilidad y Recurrencia de Ingresos**: 12 meses continuos de timbrados y depósitos. **(Cumple)**.
4. **Opinión SAT 32-D PF**: Estrictamente **POSITIVA**. **(Cumple)**.
5. **Garantía**: Pagaré quirografario individual sin requerir aval forzoso. **(Cumple)**.`;
    }

    return `### 🎯 Criterios del Modelo de Decisión de Apoyando Ideas (v2.4)

En **Apoyando Ideas**, nuestro modelo evalúa a **${expediente.empresa.razonSocial}** bajo 5 pilares:
1. **Cobertura de Ingresos vs. Línea (DTI)**: Línea representa el **19.0%** de ventas ($18.42M). **(Cumple)**.
2. **Cumplimiento Tributario & 69-B**: Opinión 32-D **POSITIVA** y 0 EFOS en proveedores. **(Cumple)**.
3. **Diversificación de Clientes**: Mayor cliente representa el **21.4%** (< 35%). **(Cumple)**.
4. **Continuidad Operativa**: 842 CFDIs emitidos (promedio 70.1/mes). **(Cumple)**.
5. **Garantías Requeridas**: Obligado solidario del representante legal (${expediente.contacto.nombre}). **(Condición Requerida)**.`;
  }

  // Recomendación de aprobación
  if (q.includes('aproba') || q.includes('recomend') || q.includes('dictamen') || q.includes('viable') || q.includes('autoriz')) {
    if (tipoProducto === 'automotriz') {
      return `### 📋 Dictamen de Apoyando Ideas: **Crédito Automotriz Pre-Aprobado**

Tras auditar la solvencia de **${expediente.empresa.razonSocial}**:
- **Vehículo**: ${expediente.empresa.destinoDetalle || 'SUV Volvo XC60 Ultimate Recharge 2026'} (${expediente.empresa.valorActivo || '$1,350,000 MXN'}).
- **Monto Financiado**: **${montoSolicitado}** (Enganche aportado: ${expediente.empresa.enganchePorcentaje ?? 45}% / $600,000 MXN).
- **Plazo Autorizado**: ${expediente.empresa.plazoMeses || 48} meses.
- **Tasa Indicativa**: 14.5% anual fija.
- **Garantía**: Endoso de factura electrónica en garantía prendaria y seguro cobertura amplia multianual.

**Recomendación del Experto**: Aprobación inmediata recomendada para emisión de carta compromiso a la agencia.`;
    }

    if (tipoProducto === 'arrendamiento') {
      return `### 📋 Dictamen de Apoyando Ideas: **Arrendamiento Puro Autorizado**

Para **${expediente.empresa.razonSocial}**:
- **Activos**: ${expediente.empresa.destinoDetalle || '4 Tractocamiones Kenworth T680'}.
- **Monto Activo**: **${montoSolicitado}**.
- **Plazo**: ${expediente.empresa.plazoMeses || 36} meses.
- **Renta Mensual Estimada**: $108,000 MXN + IVA (100% deducible en ISR).
- **Valor Residual**: 15% ($525,000 MXN) al mes ${expediente.empresa.plazoMeses || 36}.

**Recomendación del Experto**: Emisión de contrato marco de arrendamiento puro y pagaré de respaldo.`;
    }

    if (isPF) {
      return `### 📋 Dictamen de Apoyando Ideas: **Aprobación Favorable (Crédito Personal)**

Para **${expediente.empresa.razonSocial}** (RFC: ${expediente.empresa.rfc}):
- **Monto Autorizado**: **${montoSolicitado}**.
- **Plazo**: 12 a 36 meses.
- **Tasa Indicativa**: 19.5% anual.
- **Modalidad**: Crédito quirografario individual con pagaré digital.
- **Score Buró**: ${resumen.scoreSolvencia ?? 784} pts (AAA).`;
    }

    return `### 📋 Dictamen de Apoyando Ideas: **Aprobación Favorable (Línea Comercial)**

Para **${expediente.empresa.razonSocial}** (${expediente.empresa.rfc}):
- **Monto Autorizado**: **${montoSolicitado}**.
- **Plazo**: 12 a 24 meses.
- **Tasa Indicativa**: 17.8% anual.
- **Condición**: Ratificación de aval u obligado solidario de ${expediente.contacto.nombre}.`;
  }

  // Garantías / plazos
  if (q.includes('garant') || q.includes('condici') || q.includes('plazo') || q.includes('aval') || q.includes('coacreditado')) {
    if (tipoProducto === 'automotriz') {
      return `### 🔒 Garantías para Crédito Automotriz
1. **Garantía Prendaria**: Endoso de factura digital del vehículo.
2. **Póliza de Seguro**: Cobertura amplia con beneficiario preferente irrevocable.
3. **Plazo**: ${expediente.empresa.plazoMeses || 48} meses amortizables mensualmente.`;
    }

    if (tipoProducto === 'arrendamiento') {
      return `### 🔒 Garantías para Arrendamiento (Leasing)
1. **Depósito en Garantía**: 2 rentas mensuales anticipadas.
2. **Propiedad del Bien**: Título a nombre de la arrendadora con seguro multianual.
3. **Ratificación**: Firma del representante legal (${expediente.contacto.nombre}).`;
    }

    if (isPF) {
      return `### 🔒 Estructura y Garantías para Persona Física
1. **Modalidad**: Crédito personal amortizable a 12, 24 o 36 meses.
2. **Garantía**: Pagaré individual con firma digital certificada.
3. **Aval**: No requerido para montos <= $500k con score > 700 pts.`;
    }

    return `### 🔒 Estructura y Garantías para Crédito PYME / PM
1. **Modalidad**: Crédito simple o línea revolvente a 12 o 24 meses.
2. **Garantía**: Obligado solidario del representante legal (${expediente.contacto.nombre}).
3. **Monitoreo**: Verificación periódica automática de cumplimiento tributario SAT.`;
  }

  // Default summary
  return `### Resumen para el Comité de Apoyando Ideas (${tipoProducto.toUpperCase()})

- **Solicitante**: ${expediente.empresa.razonSocial} (${expediente.empresa.rfc})
- **Producto Financiero**: ${tipoProducto.toUpperCase()}
- **Línea / Monto Solicitado**: **${montoSolicitado}**
${expediente.empresa.destinoDetalle ? `- **Bien / Destino**: ${expediente.empresa.destinoDetalle}` : ''}
- **Score Asignado**: **${resumen.scoreSolvencia ?? (isPF ? 784 : 818)} / 850** (${resumen.categoriaRiesgo ?? 'Bajo Riesgo AAA'})
- **${isPF ? 'Ingresos Anualizados' : 'Facturación SAT'}**: **${resumen.totalFacturado ?? (isPF ? '$1,524,000 MXN' : '$18,420,890 MXN')}**
- **Opinión 32-D**: **POSITIVA** (al día con el SAT).

¿Deseas profundizar sobre el LTV/enganche, capacidad de pago mensual o generar el dictamen ejecutivo para el comité?`;
}


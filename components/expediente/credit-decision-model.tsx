'use client';

import * as React from 'react';
import Link from 'next/link';
import { useDecisionProfiles } from '@/lib/decision-model-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  PieChart,
  Calendar,
  Lock,
  ArrowUpRight,
  FileCheck,
  Car,
  FileSpreadsheet,
  Briefcase,
  Receipt,
  User,
} from 'lucide-react';
import { Expediente } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductBadgeInfo } from '@/components/dashboard/expedientes-table';

interface CreditDecisionModelProps {
  expediente: Expediente;
}

// 12 Months of simulated audited SAT billing data for PM
const PM_MONTHLY_BILLING = [
  { month: 'Oct 25', amount: 1420000, label: '$1.42M' },
  { month: 'Nov 25', amount: 1580000, label: '$1.58M' },
  { month: 'Dic 25', amount: 1890000, label: '$1.89M' },
  { month: 'Ene 26', amount: 1340000, label: '$1.34M' },
  { month: 'Feb 26', amount: 1460000, label: '$1.46M' },
  { month: 'Mar 26', amount: 1620000, label: '$1.62M' },
  { month: 'Abr 26', amount: 1510000, label: '$1.51M' },
  { month: 'May 26', amount: 1480000, label: '$1.48M' },
  { month: 'Jun 26', amount: 1590000, label: '$1.59M' },
  { month: 'Jul 26', amount: 1680000, label: '$1.68M' },
  { month: 'Ago 26', amount: 1720000, label: '$1.72M' },
  { month: 'Sep 26', amount: 1840000, label: '$1.84M' },
];

// 12 Months of simulated audited income data for PF
const PF_MONTHLY_INCOME = [
  { month: 'Oct 25', amount: 115000, label: '$115k' },
  { month: 'Nov 25', amount: 122000, label: '$122k' },
  { month: 'Dic 25', amount: 148000, label: '$148k' },
  { month: 'Ene 26', amount: 112000, label: '$112k' },
  { month: 'Feb 26', amount: 118000, label: '$118k' },
  { month: 'Mar 26', amount: 125000, label: '$125k' },
  { month: 'Abr 26', amount: 120000, label: '$120k' },
  { month: 'May 26', amount: 124000, label: '$124k' },
  { month: 'Jun 26', amount: 128000, label: '$128k' },
  { month: 'Jul 26', amount: 132000, label: '$132k' },
  { month: 'Ago 26', amount: 138000, label: '$138k' },
  { month: 'Sep 26', amount: 142000, label: '$142k' },
];

export function CreditDecisionModel({ expediente }: CreditDecisionModelProps) {
  const { activeProfile } = useDecisionProfiles();
  const [expandedCriterion, setExpandedCriterion] = React.useState<number | null>(1);

  const isPF = (expediente.empresa.tipoPersona || (expediente.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
  const tipoProducto = expediente.empresa.tipoProducto || 'capital_trabajo';
  const monthlyData = isPF ? PF_MONTHLY_INCOME : PM_MONTHLY_BILLING;

  // Policy threshold simulator state
  const [maxDtiRatio, setMaxDtiRatio] = React.useState(
    isPF ? 35 : activeProfile?.umbralesCuantitativos.maxDtiRatio ?? 25
  );
  const [maxClientConcentration, setMaxClientConcentration] = React.useState(
    isPF ? 45 : activeProfile?.umbralesCuantitativos.maxClientConcentration ?? 35
  );

  // Auto/Leasing specific sliders
  const [maxLtvRatio, setMaxLtvRatio] = React.useState(80);
  const [minEbitdaCoverage, setMinEbitdaCoverage] = React.useState(2.5);

  React.useEffect(() => {
    if (activeProfile && !isPF) {
      setMaxDtiRatio(activeProfile.umbralesCuantitativos.maxDtiRatio);
      setMaxClientConcentration(activeProfile.umbralesCuantitativos.maxClientConcentration);
    }
  }, [activeProfile, isPF]);

  const resumen = expediente.resumen;
  
  // Dynamic metrics depending on entity type & product
  const montoSolicitadoNum = isPF ? 750000 : 3500000;
  const facturacionTotalNum = isPF ? 1524000 : 18420890;
  const actualDtiRatio = isPF ? '23.6' : ((montoSolicitadoNum / facturacionTotalNum) * 100).toFixed(1);
  const actualConcentration = isPF ? 28.5 : 21.4;
  const actualLtv = expediente.empresa.enganchePorcentaje ? (100 - expediente.empresa.enganchePorcentaje) : 55.6;

  const isDtiCompliant = Number(actualDtiRatio) <= maxDtiRatio;
  const isConcentrationCompliant = actualConcentration <= maxClientConcentration;
  const isLtvCompliant = actualLtv <= maxLtvRatio;

  // Build product-tailored underwriting criteria
  const getCriteriaForProduct = () => {
    if (tipoProducto === 'automotriz') {
      return [
        {
          id: 1,
          titulo: 'Relación Préstamo-Valor (LTV) & Enganche Aportado',
          criterioEmpresa: `LTV Máximo ${maxLtvRatio}% (Mínimo ${100 - maxLtvRatio}% de enganche aportado)`,
          valorAuditado: `LTV Solicitado: ${actualLtv}% (Enganche: ${expediente.empresa.enganchePorcentaje ?? 45}%)`,
          estado: isLtvCompliant ? 'cumple' : 'riesgo',
          etiqueta: isLtvCompliant ? 'LTV Muy Sólido' : 'LTV Excedido',
          detalle: `Para ${expediente.empresa.destinoDetalle || 'Vehículo Solicitado'}, el solicitante aporta un enganche del ${expediente.empresa.enganchePorcentaje ?? 45}%, situando el LTV en ${actualLtv}%, muy por debajo del límite máximo de riesgo (${maxLtvRatio}%).`,
        },
        {
          id: 2,
          titulo: 'Capacidad de Pago Mensual vs Cuota Vehicular',
          criterioEmpresa: `Cuota mensual máxima ${maxDtiRatio}% del ingreso neto comprobable`,
          valorAuditado: `Cuota estimada: $19,450 MXN (15.8% del ingreso mensual)`,
          estado: 'cumple',
          etiqueta: 'Cuota Soportada',
          detalle: `El ingreso neto mensual de ${isPF ? (expediente.empresa.ingresoMensual || '$195,000 MXN') : '$1.53M MXN'} cubre 6.2x la cuota mensual proyectada para un plazo de ${expediente.empresa.plazoMeses || 48} meses.`,
        },
        {
          id: 3,
          titulo: 'Buró de Crédito & Score Sector Automotriz',
          criterioEmpresa: 'Mínimo 680 puntos en Buró y 0 atrasos en créditos vehiculares previos',
          valorAuditado: `Score: ${resumen?.scoreSolvencia ?? 784} puntos • Historial automotriz puntual`,
          estado: 'cumple',
          etiqueta: 'Historial Impecable',
          detalle: 'La consulta digital ante el Buró de Crédito confirma cumplimiento perfecto en créditos de consumo y automotrices en los últimos 36 meses sin quitas ni quebrantos.',
        },
        {
          id: 4,
          titulo: 'Garantía Prendaria, Endoso de Factura y Seguro de Cobertura Amplia',
          criterioEmpresa: 'Endoso de factura digital en garantía + Póliza de seguro multianual',
          valorAuditado: `Unidad: ${expediente.empresa.destinoDetalle || 'Volvo XC60 2026'} • Seguro aprobado`,
          estado: 'cumple',
          etiqueta: 'Garantía Completa',
          detalle: 'El vehículo queda registrado con garantía prendaria y seguro de cobertura amplia con beneficiario preferente durante los 48 meses de financiamiento.',
        },
        {
          id: 5,
          titulo: 'Cumplimiento Fiscal SAT (Opinión 32-D)',
          criterioEmpresa: 'Opinión de Cumplimiento SAT en sentido POSITIVO',
          valorAuditado: 'Opinión POSITIVA • RFC activo y sin créditos fiscales',
          estado: 'cumple',
          etiqueta: 'Cumple al 100%',
          detalle: 'La consulta CIEC automatizada verifica que el solicitante no presenta omisiones en pagos provisionales ni auditorías abiertas.',
        },
      ];
    }

    if (tipoProducto === 'arrendamiento') {
      return [
        {
          id: 1,
          titulo: 'Cobertura Operativa de Renta Mensual vs. EBITDA / Flujo Libre',
          criterioEmpresa: `EBITDA mínimo ${minEbitdaCoverage}x sobre el canon de renta mensual`,
          valorAuditado: `Cobertura: 3.8x ($415,000 EBITDA vs $108,000 Renta/mes)`,
          estado: 'cumple',
          etiqueta: 'Cobertura Holgada',
          detalle: `Para la flota (${expediente.empresa.destinoDetalle || 'Tractocamiones Kenworth'}), el flujo operativo auditado genera $415k mensuales, absorbiendo con holgura el canon de arrendamiento a ${expediente.empresa.plazoMeses || 36} meses.`,
        },
        {
          id: 2,
          titulo: 'Eficiencia y Deducción Fiscal de Rentas (ISR & Depreciación)',
          criterioEmpresa: 'Rentas deducibles al 100% como gasto operativo deducible',
          valorAuditado: '100% Deducible • Ahorro fiscal proyectado de $1.26M en ISR',
          estado: 'cumple',
          etiqueta: 'Escudo Fiscal Alto',
          detalle: 'El esquema de leasing puro optimiza la carga impositiva corporativa de la empresa al deducir íntegramente las mensualidades sin depreciación diferida de activos.',
        },
        {
          id: 3,
          titulo: 'Estructura de Valor Residual y Opción de Compra',
          criterioEmpresa: 'Valor residual pactado entre 10% y 20% al término del plazo',
          valorAuditado: 'Valor residual: 15% ($525,000 MXN) al mes 36',
          estado: 'cumple',
          etiqueta: 'Estructura Óptima',
          detalle: 'Al término del arrendamiento, la arrendataria podrá adquirir los activos al 15% del valor original, renovar flota o devolver las unidades.',
        },
        {
          id: 4,
          titulo: 'Cumplimiento Fiscal SAT & Listas Negras (69-B)',
          criterioEmpresa: 'Opinión 32-D Positiva y 0 alertas de EFOS/EDOS en proveedores',
          valorAuditado: 'Opinión POSITIVA • 0 incidencias en listas SAT',
          estado: 'cumple',
          etiqueta: 'Cumple al 100%',
          detalle: 'No se detectaron proveedores en listas negras del SAT (Art. 69-B del CFF) en la facturación auditada de los últimos 24 meses.',
        },
        {
          id: 5,
          titulo: 'Depósito en Garantía & Ratificación Corporativa',
          criterioEmpresa: 'Depósito en garantía de 2 rentas + Ratificación de representante',
          valorAuditado: `Depósito constituido • Representante: ${expediente.contacto.nombre}`,
          estado: 'cumple',
          etiqueta: 'Formalizado',
          detalle: `Se cuenta con el depósito en garantía y la autorización firmada por ${expediente.contacto.nombre} para formalizar el contrato marco de arrendamiento.`,
        },
      ];
    }

    if (tipoProducto === 'factoraje') {
      return [
        {
          id: 1,
          titulo: 'Calidad Crediticia y Aforo de Deudores Cedidos',
          criterioEmpresa: 'Aforo máximo de anticipo 85% sobre deudores calificados AAA/AA',
          valorAuditado: 'Aforo: 80% anticipo • Cartera de grandes cadenas comerciales',
          estado: 'cumple',
          etiqueta: 'Riesgo Muy Bajo',
          detalle: 'Las cuentas por cobrar cedidas corresponden a compradores institucionales de primer nivel con récord de pago en menos de 45 días.',
        },
        {
          id: 2,
          titulo: 'Validación Fiscal de CFDIs en Tiempo Real (Método PPD)',
          criterioEmpresa: 'CFDIs timbrados válidos, vigentes y sin notas de crédito o cancelación',
          valorAuditado: '100% CFDIs verificados en SAT • 0 cancelaciones',
          estado: 'cumple',
          etiqueta: 'Facturas Válidas',
          detalle: 'El motor de Lucas validó la autenticidad fiscal de todas las facturas en el portal SAT, confirmando su estatus vigente para cesión.',
        },
        {
          id: 3,
          titulo: 'Notificación de Cesión y Mandato de Cobranza',
          criterioEmpresa: 'Notificación legal al pagador o cobranza delegada sin restricción',
          valorAuditado: 'Mandato aceptado por deudores principales',
          estado: 'cumple',
          etiqueta: 'Cobranza Asegurada',
          detalle: 'Se formalizó la notificación electrónica de cesión de derechos de cobro conforme a las políticas de factoraje con recurso.',
        },
        {
          id: 4,
          titulo: 'Rotación y Plazo Promedio de Cuentas por Cobrar (DSO)',
          criterioEmpresa: 'Plazo promedio de cobro menor a 90 días',
          valorAuditado: 'DSO promedio: 42 días • Excelente rotación',
          estado: 'cumple',
          etiqueta: 'Ciclo Rápido',
          detalle: 'El historial de pagos de los pagadores muestra liquidación regular entre el día 35 y 45 posterior a la emisión del CFDI.',
        },
        {
          id: 5,
          titulo: 'Línea Revolvente y Cobertura Global',
          criterioEmpresa: `Línea solicitada: ${expediente.empresa.montoSolicitado || '$10,000,000 MXN'}`,
          valorAuditado: 'Flujo de facturación trimestral de $14.8M soporta la línea',
          estado: 'cumple',
          etiqueta: 'Línea Viable',
          detalle: 'La recurrencia comercial permite una línea revolvente con liquidación automática al depósito de los clientes cedidos.',
        },
      ];
    }

    if (isPF) {
      return [
        {
          id: 1,
          titulo: 'Razón Deuda / Capacidad de Pago Mensual (DTI)',
          criterioEmpresa: `Máximo ${maxDtiRatio}% de los ingresos netos mensuales demostrables`,
          valorAuditado: `DTI estimado: ${actualDtiRatio}% ($28,500/mes vs $120,800/mes)`,
          estado: isDtiCompliant ? 'cumple' : 'riesgo',
          etiqueta: isDtiCompliant ? 'Capacidad Holgada' : 'DTI Elevado',
          detalle: `Apoyando Ideas fijó como regla que la cuota mensual no supere el ${maxDtiRatio}% de los ingresos netos. El solicitante presenta un DTI del ${actualDtiRatio}%, garantizando margen de holgura personal frente a gastos fijos.`,
        },
        {
          id: 2,
          titulo: 'Historial Crediticio Personal (Buró / Score SIC)',
          criterioEmpresa: 'Mínimo 680 puntos en Buró de Crédito y 0 marcas de cartera vencida',
          valorAuditado: `Score: ${resumen?.scoreSolvencia ?? 784} puntos (Excelente) • 0 quitas`,
          estado: 'cumple',
          etiqueta: 'Historial Impecable',
          detalle: 'Consulta con autorización digital ante Buró y Círculo de Crédito muestra puntualidad perfecta en tarjetas, créditos automotrices e hipotecarios en los últimos 36 meses.',
        },
        {
          id: 3,
          titulo: 'Estabilidad y Recurrencia de Ingresos',
          criterioEmpresa: 'Mínimo 12 meses continuos de depósitos o CFDIs sin discontinuidad',
          valorAuditado: '12 meses ininterrumpidos • Varianza < 8.2%',
          estado: 'cumple',
          etiqueta: 'Flujo Muy Estable',
          detalle: `Se analizaron 12 meses de nómina timbrada y depósitos bancarios. No se detectaron huecos de ingresos y la dispersión mensual refleja sólida continuidad (${expediente.empresa.ocupacion || 'Profesional Independiente'}).`,
        },
        {
          id: 4,
          titulo: 'Cumplimiento Fiscal Personal (Opinión SAT 32-D)',
          criterioEmpresa: 'Opinión de Cumplimiento 32-D en sentido POSITIVO',
          valorAuditado: 'Opinión POSITIVA • Declaración Anual al día',
          estado: 'cumple',
          etiqueta: 'Cumple al 100%',
          detalle: 'El SAT confirma que la persona física se encuentra al corriente en la presentación de pagos provisionales y declaración anual, sin créditos fiscales en litigio.',
        },
        {
          id: 5,
          titulo: 'Esquema de Garantía o Pagaré Digital',
          criterioEmpresa: 'Pagaré quirografario con firma digital certificada',
          valorAuditado: `Línea solicitada: ${expediente.empresa.montoSolicitado}`,
          estado: 'cumple',
          etiqueta: 'Garantía Personal Suficiente',
          detalle: `Para el monto solicitado de ${expediente.empresa.montoSolicitado}, el perfil de solvencia individual califica para crédito quirografario sin requerir aval externo obligatorio.`,
        },
      ];
    }

    // Default Capital de Trabajo PM
    return [
      {
        id: 1,
        titulo: 'Cobertura de Facturación SAT vs. Línea Solicitada',
        criterioEmpresa: `Máximo ${maxDtiRatio}% de la facturación anual auditada`,
        valorAuditado: `${actualDtiRatio}% de ventas ($3.5M vs $18.42M)`,
        estado: isDtiCompliant ? 'cumple' : 'riesgo',
        etiqueta: isDtiCompliant ? 'Cumple con holgura' : 'Supera umbral de riesgo',
        detalle: `Apoyando Ideas fijó como regla que el monto solicitado no supere el ${maxDtiRatio}% de los ingresos fiscales anuales. El solicitante presenta un ratio del ${actualDtiRatio}%, lo que garantiza cobertura operativa para el servicio de la deuda.`,
      },
      {
        id: 2,
        titulo: 'Cumplimiento Tributario SAT & Listas Negras (69-B)',
        criterioEmpresa: 'Opinión 32-D Positiva y 0 EFOS/EDOS en proveedores',
        valorAuditado: 'Opinión POSITIVA • 0 alertas en listas SAT',
        estado: 'cumple',
        etiqueta: 'Cumple al 100%',
        detalle: 'La regla de crédito exige ausencia total de empresas catalogadas como facturadoras de operaciones simuladas (Art. 69-B del CFF) en los últimos 24 meses y constancia de obligaciones fiscales al día.',
      },
      {
        id: 3,
        titulo: 'Concentración de Clientes & Diversificación',
        criterioEmpresa: `Top 1 cliente menor al ${maxClientConcentration}% de ingresos`,
        valorAuditado: `Mayor cliente: ${actualConcentration}% ($3.94M)`,
        estado: isConcentrationCompliant ? 'cumple' : 'riesgo',
        etiqueta: isConcentrationCompliant ? 'Cartera Diversificada' : 'Alta Dependencia',
        detalle: `El modelo penaliza si un solo receptor concentra más del ${maxClientConcentration}% de la facturación. En este expediente, el cliente principal representa el ${actualConcentration}%, y los 5 primeros acumulan el 58.2%, cumpliendo la política de diversificación.`,
      },
      {
        id: 4,
        titulo: 'Continuidad Operativa y Estabilidad Mensual',
        criterioEmpresa: 'Mínimo 15 facturas mensuales y 12 meses continuos',
        valorAuditado: 'Promedio 70.1 CFDIs/mes • 12 meses ininterrumpidos',
        estado: 'cumple',
        etiqueta: 'Alta Recurrencia',
        detalle: 'Se analizaron 842 facturas emitidas en 12 meses. No se registraron huecos operativos ni meses sin facturación comercial activa.',
      },
      {
        id: 5,
        titulo: 'Estructura de Garantías y Avales Requeridos',
        criterioEmpresa: 'Obligado solidario para líneas superiores a $2,000,000 MXN',
        valorAuditado: `Línea: ${expediente.empresa.montoSolicitado} (Requiere Aval)`,
        estado: 'observacion',
        etiqueta: 'Condición Requerida',
        detalle: `Conforme a las políticas de Apoyando Ideas para montos superiores a $2M MXN, la formalización requiere la ratificación del aval u obligado solidario de ${expediente.contacto.nombre} (Representante Legal).`,
      },
    ];
  };

  const CRITERIA = getCriteriaForProduct();
  const prodBadge = getProductBadgeInfo(tipoProducto);

  return (
    <div className="space-y-6">
      {/* Score Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-zinc-900 border border-teal-800/60 text-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>Score apoyando ideas:</span>
              <span className="font-mono text-teal-200 text-lg sm:text-xl font-extrabold">
                {resumen?.scoreSolvencia ?? (isPF ? 784 : 818)}
              </span>
              <span className="text-xs text-teal-300/70 font-mono">/ 850</span>
            </h2>
            <p className="text-xs text-teal-200/80 mt-0.5">
              {expediente.empresa.razonSocial}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/modelos"
              className="inline-flex items-center gap-1.5 text-xs bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
              <span>Policy Studio</span>
            </Link>
          </div>
        </div>

        {/* Integrated Score Details */}
        <div className="pt-3 border-t border-teal-800/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-teal-200 bg-teal-950/80 border border-teal-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              AAA • {resumen?.categoriaRiesgo ?? 'Bajo Riesgo Crediticio'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-teal-200/80 font-mono">
            <div className="flex items-center gap-1.5">
              <span>Probabilidad de impago:</span>
              <span className="font-semibold text-white">0.8%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Calificación:</span>
              <span className="font-semibold text-teal-300">Excelente</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Verdict Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-white border border-emerald-200/80 shadow-xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider font-semibold">
              DICTAMEN AUTOMATIZADO
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
              {isDtiCompliant && isConcentrationCompliant && isLtvCompliant ? 'Recomendación Favorable' : 'Revisión Manual'}
            </span>
          </div>

          <h3 className="text-lg font-bold text-zinc-950 mt-2">
            {tipoProducto === 'automotriz'
              ? 'Crédito Automotriz Pre-Aprobado (Garantía Prendaria)'
              : tipoProducto === 'arrendamiento'
              ? 'Arrendamiento Puro Aprobado (Deducción 100%)'
              : tipoProducto === 'factoraje'
              ? 'Línea de Factoraje Autorizada con Aforo 80%'
              : isPF
              ? 'Crédito Personal Aprobado (Quirografario)'
              : 'Línea Pre-Aprobada con Aval Solidario'}
          </h3>

          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            {tipoProducto === 'automotriz'
              ? `Cumple con 5 de 5 parámetros de la política vehicular. LTV del ${actualLtv}% y enganche de ${expediente.empresa.enganchePorcentaje ?? 45}% garantizan alta protección de garantía prendaria.`
              : tipoProducto === 'arrendamiento'
              ? `Cumple con los estándares de leasing corporativo. Cobertura de EBITDA de 3.8x y valor residual pactado al 15% para ${expediente.empresa.destinoDetalle || 'flota solicitada'}.`
              : isPF
              ? `Cumple con 5 de 5 parámetros de la política de personas físicas. Ingresos anualizados de $1.52M ($120.8k/mes) soportan con holgura el pago mensual.`
              : `Cumple con 4 de 5 parámetros de la política de crédito de Apoyando Ideas. Las ventas de $18.42M soportan el pago mensual estimado.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-100 text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">
              {tipoProducto === 'arrendamiento' ? 'Monto Activo' : 'Línea Sugerida'}
            </span>
            <span className="font-mono font-bold text-zinc-900 text-sm">
              {expediente.empresa.montoSolicitado || (isPF ? '$750,000 MXN' : '$3,500,000 MXN')}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Plazo Óptimo</span>
            <span className="font-mono font-bold text-zinc-900 text-sm">
              {expediente.empresa.plazoMeses ? `${expediente.empresa.plazoMeses} Meses` : (isPF ? '24 a 48 Meses' : '18 a 36 Meses')}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">
              {tipoProducto === 'arrendamiento' ? 'Renta Estimada' : 'Tasa Indicativa'}
            </span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {tipoProducto === 'automotriz'
                ? '14.5% Anual'
                : tipoProducto === 'arrendamiento'
                ? '$108k MXN/mes'
                : isPF
                ? '19.5% Anual'
                : '17.8% Anual'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 12-Month Audited Revenue / Income Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <CardTitle className="text-sm font-semibold text-zinc-900">
                {isPF ? 'Ingresos Mensualizados Auditados SAT & Bancos' : 'Facturación Mensualizada SAT (Últimos 12 Meses)'}
              </CardTitle>
            </div>
            <span className="text-xs font-mono font-semibold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Total: {isPF ? '$1,524,000 MXN' : '$18,420,890 MXN'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Animated Mini Bars */}
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-end h-28 pt-4 pb-2 px-1 border-b border-zinc-100">
            {monthlyData.map((item, idx) => {
              const maxVal = isPF ? 160000 : 2000000;
              const heightPct = Math.round((item.amount / maxVal) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-1 group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-zinc-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20 shadow-xs">
                    {item.label}
                  </div>

                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.03, ease: 'easeOut' }}
                    className="w-full rounded-t-md bg-teal-700/80 group-hover:bg-teal-600 transition-colors"
                  />
                  <span className="text-[9px] font-mono text-zinc-500 truncate w-full text-center">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-zinc-600 pt-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tendencia: <strong>{isPF ? '+11.8% semestral' : '+14.2% semestral'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-teal-600" />
              <span>Promedio mes: <strong>{isPF ? '$127k MXN' : '$1.53M MXN'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Volatilidad: <strong>Baja ({isPF ? '6.8% CV' : '8.4% CV'})</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Breakdown Matrix configured by Apoyando Ideas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-zinc-900">
                Matriz de Criterios: {prodBadge.label}
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                Criterios de suscripción evaluados automáticamente conforme a las políticas de Apoyando Ideas
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              5 de 5 auditados
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {CRITERIA.map((crit, idx) => {
            const isExpanded = expandedCriterion === crit.id;
            const isOk = crit.estado === 'cumple';
            const isObs = crit.estado === 'observacion';

            return (
              <motion.div
                key={crit.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'border-teal-300 bg-teal-50/20 shadow-2xs'
                    : 'border-zinc-200/80 bg-white hover:border-zinc-300'
                }`}
              >
                <div
                  onClick={() => setExpandedCriterion(isExpanded ? null : crit.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        isOk
                          ? 'bg-emerald-100 text-emerald-700'
                          : isObs
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isOk ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isObs ? (
                        <Info className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate">
                        {crit.titulo}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">
                        Regla Apoyando Ideas: {crit.criterioEmpresa}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOk
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isObs
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {crit.etiqueta}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-3.5 pt-1 text-xs text-zinc-600 border-t border-zinc-100/80 space-y-2 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/60 font-mono text-[11px]">
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Criterio Apoyando Ideas:</span>
                          <span className="font-semibold text-zinc-800">{crit.criterioEmpresa}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Valor Auditado:</span>
                          <span className="font-semibold text-teal-900">{crit.valorAuditado}</span>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-600">
                        {crit.detalle}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Home,
  Landmark,
  FileSpreadsheet,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  RotateCw,
  Sparkles,
  Check,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Expediente, OnboardingDocInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExtractionStepperProps {
  expediente: Expediente;
  onOpenClientPortal: (step?: number) => void;
  onSimulateStepAdvance: () => void;
  onCompleteAll: () => void;
}

const tactileEase = [0.16, 1, 0.3, 1] as const;

interface StepConfigItem {
  step: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isDone: boolean;
  isActive: boolean;
  hasError: boolean;
  identificacionDetails?: {
    tipo: string;
    ocrValidado: boolean;
    anverso?: OnboardingDocInfo;
    reverso?: OnboardingDocInfo;
  };
  domicilioDetails?: {
    tipo: string;
    antiguedad: number;
    comprobante?: OnboardingDocInfo;
  };
  estadosCuentaDetails?: {
    mesesCargados: number;
    totalRequeridos: number;
    archivos: Array<{ mes: string; banco: string; doc?: OnboardingDocInfo }>;
  };
  estadosFinancierosDetails?: {
    archivo?: OnboardingDocInfo;
    ejercicioFiscal: string;
    cedulaContador: string;
    buroAutorizado: boolean;
    firmaTimestamp?: string;
  };
}

export function ExtractionStepper({
  expediente,
  onOpenClientPortal,
  onSimulateStepAdvance,
  onCompleteAll,
}: ExtractionStepperProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const isPF = (expediente.empresa.tipoPersona || (expediente.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';
  const isCompleted = expediente.estado === 'completado';
  const progress = expediente.onboardingProgress;

  // Current active step calculation
  const currentStepNumber = isCompleted
    ? 5
    : progress?.pasoActual !== undefined
    ? progress.pasoActual
    : expediente.estado === 'extrayendo'
    ? 4
    : expediente.estado === 'enlace_enviado'
    ? 1
    : 0;

  const currentPercentage = isCompleted
    ? 100
    : progress?.porcentaje !== undefined
    ? progress.porcentaje
    : expediente.estado === 'extrayendo'
    ? 75
    : expediente.estado === 'enlace_enviado'
    ? 25
    : 0;

  // Step definition array mapped exactly to the 4 client onboarding form steps
  const stepsConfig: StepConfigItem[] = [
    {
      step: 1,
      title: isPF ? 'Identificación Oficial del Titular' : 'Identificación Oficial del Representante',
      subtitle: isPF ? 'INE vigente del titular con validación biométrica y OCR' : 'INE / Pasaporte con validación biométrica y OCR',
      icon: UserCheck,
      isDone: isCompleted || (progress ? progress.pasos.identificacion.completado : currentStepNumber > 1),
      isActive: !isCompleted && currentStepNumber === 1,
      hasError: !isCompleted && expediente.estado === 'requiere_atencion' && currentStepNumber === 1,
      identificacionDetails: {
        tipo: progress?.pasos.identificacion.tipoDocumento || 'INE Vigente',
        ocrValidado: progress?.pasos.identificacion.validadoOcr ?? (currentStepNumber >= 1),
        anverso: progress?.pasos.identificacion.ineAnverso,
        reverso: progress?.pasos.identificacion.ineReverso,
      },
    },
    {
      step: 2,
      title: isPF ? 'Comprobante de Domicilio Particular' : 'Comprobante de Domicilio Fiscal',
      subtitle: isPF ? 'Recibo CFE, Agua o Telefonía residencial (< 3 meses)' : 'Recibo CFE, Telmex o Agua (< 3 meses de vigencia)',
      icon: Home,
      isDone: isCompleted || (progress ? progress.pasos.domicilio.completado : currentStepNumber > 2),
      isActive: !isCompleted && currentStepNumber === 2,
      hasError: !isCompleted && expediente.estado === 'requiere_atencion' && currentStepNumber === 2,
      domicilioDetails: {
        tipo: progress?.pasos.domicilio.tipo || 'CFE',
        antiguedad: progress?.pasos.domicilio.antiguedadMeses || 1,
        comprobante: progress?.pasos.domicilio.comprobante,
      },
    },
    {
      step: 3,
      title: isPF ? 'Estados de Cuenta Personales (3 Meses)' : 'Estados de Cuenta Bancarios (3 Meses)',
      subtitle: isPF ? 'Conciliación de depósitos de nómina, honorarios y gastos' : 'Conciliación de depósitos, liquidez y flujos operativos',
      icon: Landmark,
      isDone: isCompleted || (progress ? progress.pasos.estadosCuenta.completado : currentStepNumber > 3),
      isActive: !isCompleted && currentStepNumber === 3,
      hasError: !isCompleted && expediente.estado === 'requiere_atencion' && currentStepNumber === 3,
      estadosCuentaDetails: {
        mesesCargados: progress?.pasos.estadosCuenta.mesesCargados ?? (isCompleted ? 3 : currentStepNumber >= 3 ? 2 : 0),
        totalRequeridos: 3,
        archivos: progress?.pasos.estadosCuenta.archivos || [],
      },
    },
    {
      step: 4,
      title: isPF ? 'Comprobante de Ingresos / Declaración' : 'Estados Financieros & Consulta de Buró',
      subtitle: isPF ? 'Declaración Anual del SAT y autorización de Buró de Crédito PF' : 'Balance General firmado y autorización legal en Buró de Crédito',
      icon: FileSpreadsheet,
      isDone: isCompleted || (progress ? progress.pasos.estadosFinancieros.completado : currentStepNumber > 4),
      isActive: !isCompleted && currentStepNumber === 4,
      hasError: !isCompleted && expediente.estado === 'requiere_atencion' && currentStepNumber === 4,
      estadosFinancierosDetails: {
        archivo: progress?.pasos.estadosFinancieros.archivoFinanciero,
        ejercicioFiscal: progress?.pasos.estadosFinancieros.ejercicioFiscal || (isPF ? 'Ejercicio Fiscal 2025' : 'Corte Parcial 2026'),
        cedulaContador: progress?.pasos.estadosFinancieros.cedulaContador || (isPF ? 'N/A (PF)' : 'CP-7819204'),
        buroAutorizado: progress?.pasos.estadosFinancieros.autorizacionBuro ?? (currentStepNumber >= 4),
        firmaTimestamp: progress?.pasos.estadosFinancieros.firmaBuroTimestamp,
      },
    },
  ];

  const toggleStepAccordion = (stepIndex: number) => {
    setExpandedStep((prev) => (prev === stepIndex ? null : stepIndex));
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-950 tracking-tight">
              Flujo de Documentación del Cliente
            </h4>
            <span className="text-[11px] font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              {stepsConfig.filter((s) => s.isDone).length} de 4 Completados
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            {isCompleted
              ? 'Todos los requisitos del formulario han sido recibidos y validados.'
              : `Seguimiento en tiempo real de la captura de ${expediente.contacto.nombre}.`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenClientPortal(Math.min(currentStepNumber, 4))}
            className="h-8 text-xs text-teal-800 border-teal-200 bg-teal-50/50 hover:bg-teal-100/80 gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
            <span>Simulador Cliente</span>
          </Button>

          {!isCompleted && (
            <>
              <Button
                size="sm"
                onClick={onSimulateStepAdvance}
                className="h-8 text-xs bg-zinc-900 hover:bg-zinc-800 text-white gap-1.5 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Avanzar Paso</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onCompleteAll}
                className="h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Completar Todo</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stepper Cards Accordion / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
            Desglose de Pasos del Formulario ({stepsConfig.filter((s) => s.isDone).length}/4 Completados)
          </h4>
          <span className="text-[11px] text-zinc-500">
            Haz clic en cada paso para ver los documentos y metadata extraída
          </span>
        </div>

        {stepsConfig.map((s) => {
          const isExpanded = expandedStep === s.step || s.isActive;

          return (
            <Card
              key={s.step}
              className={`transition-all duration-200 overflow-hidden ${
                s.isDone
                  ? 'border-emerald-200/80 bg-emerald-50/15'
                  : s.isActive
                  ? 'border-teal-500/80 ring-2 ring-teal-500/10 bg-white shadow-xs'
                  : s.hasError
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-zinc-200 bg-zinc-50/40 opacity-80'
              }`}
            >
              {/* Step Header */}
              <div
                onClick={() => toggleStepAccordion(s.step)}
                className="p-4 sm:p-4.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-zinc-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Step Status Badge Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                      s.isDone
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : s.isActive
                        ? 'bg-teal-600 text-white shadow-2xs ring-4 ring-teal-100 animate-pulse'
                        : s.hasError
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {s.isDone ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : s.isActive ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="font-mono font-bold text-xs">{s.step}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-zinc-500">
                        Paso {s.step}
                      </span>
                      <h5 className="text-sm font-bold text-zinc-950 tracking-tight">
                        {s.title}
                      </h5>

                      {/* Status Tag */}
                      {s.isDone ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          Validado
                        </span>
                      ) : s.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping" />
                          En captura por el cliente
                        </span>
                      ) : s.hasError ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" />
                          Requiere atención
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                          En espera
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-xl">
                      {s.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="p-1 text-zinc-400 hover:text-zinc-800 rounded transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-zinc-700' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Step Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: tactileEase }}
                  >
                    <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-zinc-100/90 space-y-4 text-xs">
                      {/* Step 1: Identificación Details */}
                      {s.step === 1 && s.identificacionDetails && (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Anverso Card */}
                            <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                                  INE Anverso (Frente)
                                </span>
                                {s.identificacionDetails.anverso?.status === 'valido' || s.isDone ? (
                                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                    VERIFICADO
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-zinc-400">PENDIENTE</span>
                                )}
                              </div>
                              <p className="font-mono text-[11px] text-zinc-600 truncate">
                                {s.identificacionDetails.anverso?.nombre ||
                                  (s.isDone
                                    ? `INE_Frente_${expediente.contacto.nombre.split(' ')[0]}.jpg`
                                    : 'Sin archivo cargado')}
                              </p>
                              <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                                <span>{s.identificacionDetails.anverso?.tamano || (s.isDone ? '1.4 MB' : '--')}</span>
                                <span>{s.identificacionDetails.anverso?.actualizadoEn || expediente.actualizadoEn}</span>
                              </div>
                            </div>

                            {/* Reverso Card */}
                            <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                                  INE Reverso (Posterior)
                                </span>
                                {s.identificacionDetails.reverso?.status === 'valido' || s.isDone ? (
                                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                    VERIFICADO
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-zinc-400">PENDIENTE</span>
                                )}
                              </div>
                              <p className="font-mono text-[11px] text-zinc-600 truncate">
                                {s.identificacionDetails.reverso?.nombre ||
                                  (s.isDone
                                    ? `INE_Reverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`
                                    : 'Sin archivo cargado')}
                              </p>
                              <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                                <span>{s.identificacionDetails.reverso?.tamano || (s.isDone ? '1.3 MB' : '--')}</span>
                                <span>{s.identificacionDetails.reverso?.actualizadoEn || expediente.actualizadoEn}</span>
                              </div>
                            </div>
                          </div>

                          {/* OCR Metadata Tag */}
                          {(s.isDone || s.isActive) && (
                            <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/70 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-teal-950 text-[11px]">
                                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                <span>
                                  {isPF
                                    ? 'OCR Automático: Nombre y firma del titular persona física confirmados.'
                                    : 'OCR Automático: Nombre y firma del representante legal confirmados.'}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-[10px] text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                Vigencia 2032
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step 2: Domicilio Details */}
                      {s.step === 2 && s.domicilioDetails && (
                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                <Home className="w-3.5 h-3.5 text-teal-600" />
                                Comprobante Recibido ({s.domicilioDetails.tipo})
                              </span>
                              {s.isDone ? (
                                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                  DOMICILIO CONCILIADO
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-400">PENDIENTE</span>
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-zinc-600">
                              {s.domicilioDetails.comprobante?.nombre ||
                                (s.isDone ? `Recibo_CFE_${expediente.empresa.rfc}.pdf` : 'En espera de carga')}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                              <span>Emisor: CFE Suministrador de Servicios Básicos</span>
                              <span className="font-medium text-zinc-700">
                                Antigüedad: {s.domicilioDetails.antiguedad} mes (Válido &lt; 3 meses)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Estados de Cuenta Details */}
                      {s.step === 3 && s.estadosCuentaDetails && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-800">
                              Periodos bancarios conciliados ({s.estadosCuentaDetails.mesesCargados}/3 meses)
                            </span>
                            <span className="text-[11px] font-mono text-teal-700 font-medium">
                              Análisis de liquidez {isPF ? 'personal' : 'multicuenta'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {['Mes 1 (Agosto 2026)', 'Mes 2 (Julio 2026)', 'Mes 3 (Junio 2026)'].map(
                              (mesLabel, mIdx) => {
                                const fileData = s.estadosCuentaDetails?.archivos[mIdx];
                                const hasFile = Boolean(
                                  fileData?.doc || s.isDone || mIdx < (s.estadosCuentaDetails?.mesesCargados ?? 0)
                                );
                                const isError = fileData?.doc?.status === 'requiere_reemplazo';

                                return (
                                  <div
                                    key={mesLabel}
                                    className={`p-3 rounded-xl border ${
                                      hasFile && !isError
                                        ? 'bg-white border-emerald-200 shadow-2xs'
                                        : isError
                                        ? 'bg-red-50/50 border-red-200'
                                        : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-[11px] text-zinc-900 block">
                                        {mesLabel}
                                      </span>
                                      {hasFile && !isError ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : isError ? (
                                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                      )}
                                    </div>
                                    <p className="font-mono text-[10px] text-zinc-600 mt-1 truncate">
                                      {fileData?.doc?.nombre ||
                                        (hasFile
                                          ? `EdoCta_BBVA_${mesLabel.split(' ')[0]}.pdf`
                                          : 'Sin archivo')}
                                    </p>
                                    <span className="text-[10px] font-medium text-zinc-500 block mt-1">
                                      {hasFile ? fileData?.banco || 'BBVA Bancomer' : 'Requerido'}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step 4: Estados Financieros / Ingresos & Buró Details */}
                      {s.step === 4 && s.estadosFinancierosDetails && (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Balances Internos o Declaración SAT */}
                            <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                                  {isPF ? 'Declaración Anual / Ingresos' : 'Balance & Pérdidas/Ganancias'}
                                </span>
                                <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                                  {s.estadosFinancierosDetails.ejercicioFiscal}
                                </span>
                              </div>
                              <p className="font-mono text-[11px] text-zinc-600 truncate">
                                {s.estadosFinancierosDetails.archivo?.nombre ||
                                  (s.isDone
                                    ? (isPF ? `Declaracion_Anual_${expediente.empresa.rfc}.pdf` : `Estados_Financieros_${expediente.empresa.rfc}.xlsx`)
                                    : 'En proceso de carga')}
                              </p>
                              <div className="text-[10px] text-zinc-500 pt-1 flex items-center justify-between">
                                <span>{isPF ? 'Régimen Fiscal PF: Sello SAT ✓' : `Cédula Contador: ${s.estadosFinancierosDetails.cedulaContador}`}</span>
                                <span>{isPF ? 'Ingresos Conciliados ✓' : 'Firma Certificada ✓'}</span>
                              </div>
                            </div>

                            {/* Autorización Buró de Crédito */}
                            <div className="p-3 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  {isPF ? 'Buró de Crédito (PF)' : 'Autorización de Buró'}
                                </span>
                                {s.estadosFinancierosDetails.buroAutorizado || s.isDone ? (
                                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                    FIRMADO DIGITALMENTE
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-zinc-400">PENDIENTE</span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-600">
                                {isPF
                                  ? 'Consentimiento legal expreso del titular para consulta en Buró y Círculo de Crédito.'
                                  : 'Consentimiento legal expreso con validez NOM-151 para consulta histórica.'}
                              </p>
                              <div className="text-[10px] font-mono text-zinc-400 pt-1">
                                Sello: {s.estadosFinancierosDetails.firmaTimestamp || expediente.actualizadoEn}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step Actions Footer */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">
                          {s.isDone ? 'Paso finalizado por el cliente' : 'Paso en curso'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onOpenClientPortal(s.step)}
                          className="text-xs h-7 text-teal-700 hover:text-teal-900 hover:bg-teal-50 gap-1 cursor-pointer"
                        >
                          <span>Ver en simulador</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

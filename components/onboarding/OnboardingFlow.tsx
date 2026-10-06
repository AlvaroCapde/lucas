'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
} from 'lucide-react';

import { Expediente } from '@/lib/types';
import { useExpedientes } from '@/lib/expedientes-store';
import { OnboardingState } from './types';
import { StepWelcome } from './StepWelcome';
import { StepIdentity } from './StepIdentity';
import { StepAddress } from './StepAddress';
import { StepSatCredentials } from './StepSatCredentials';
import { StepBankStatements } from './StepBankStatements';
import { StepInternalFinancials } from './StepInternalFinancials';
import { StepSuccess } from './StepSuccess';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
  expediente: Expediente;
  initialStep?: number;
  previewMode?: 'mobile' | 'responsive';
}

export function OnboardingFlow({
  expediente,
  initialStep = 0,
}: OnboardingFlowProps) {
  const router = useRouter();
  const { updateExpediente } = useExpedientes();
  const isPersonaFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  const stepsNav = [
    { id: 0, title: 'Introducción', short: 'Inicio' },
    { id: 1, title: isPersonaFisica ? 'Identificación oficial (Titular)' : 'Identificación oficial (Representante)', short: 'Identificación' },
    { id: 2, title: isPersonaFisica ? 'Comprobante de domicilio particular' : 'Comprobante de domicilio fiscal', short: 'Domicilio' },
    { id: 3, title: 'Sincronización SAT', short: 'Sincronización' },
    { id: 4, title: isPersonaFisica ? 'Estados de cuenta personales' : 'Estados de cuenta bancarios', short: 'Bancos' },
    { id: 5, title: isPersonaFisica ? 'Comprobación de ingresos / Declaración' : 'Estados financieros internos', short: isPersonaFisica ? 'Ingresos' : 'Financieros' },
    { id: 6, title: 'Confirmación y envío', short: 'Envío' },
  ];

  const [state, setState] = useState<OnboardingState>(() => {
    const p = expediente.onboardingProgress;
    return {
      currentStep: initialStep || (p?.pasoActual !== undefined ? Math.min(p.pasoActual, 5) : 0),
      buroConsent: p?.pasos.estadosFinancieros.autorizacionBuro ?? true,
      buroSignature: p?.pasos.estadosFinancieros.firmaBuroTimestamp ? 'signed' : null,
      signatureType: 'draw',
      typedSignatureName: expediente.contacto.nombre,
      buroConsentDate: p?.pasos.estadosFinancieros.firmaBuroTimestamp || null,
      ineFront: p?.pasos.identificacion.ineAnverso
        ? {
            name: p.pasos.identificacion.ineAnverso.nombre || 'INE_Anverso.jpg',
            size: p.pasos.identificacion.ineAnverso.tamano || '1.4 MB',
            uploadedAt: p.pasos.identificacion.ineAnverso.actualizadoEn || expediente.actualizadoEn,
            status: 'valid',
          }
        : null,
      ineBack: p?.pasos.identificacion.ineReverso
        ? {
            name: p.pasos.identificacion.ineReverso.nombre || 'INE_Reverso.jpg',
            size: p.pasos.identificacion.ineReverso.tamano || '1.2 MB',
            uploadedAt: p.pasos.identificacion.ineReverso.actualizadoEn || expediente.actualizadoEn,
            status: 'valid',
          }
        : null,
      addressDoc: p?.pasos.domicilio.comprobante
        ? {
            name: p.pasos.domicilio.comprobante.nombre || 'Recibo_CFE.pdf',
            size: p.pasos.domicilio.comprobante.tamano || '1.6 MB',
            uploadedAt: p.pasos.domicilio.comprobante.actualizadoEn || expediente.actualizadoEn,
            status: 'valid',
          }
        : null,
      addressType: (p?.pasos.domicilio.tipo?.toLowerCase() as 'cfe' | 'telmex' | 'otro') || 'cfe',
      siecKey: 'LucasSAT2026!',
      satValidated: true,
      bankStatements: {
        month1: p?.pasos.estadosCuenta.archivos[0]?.doc
          ? {
              name: p.pasos.estadosCuenta.archivos[0].doc.nombre || 'EdoCta_Mes1.pdf',
              size: p.pasos.estadosCuenta.archivos[0].doc.tamano || '2.4 MB',
              uploadedAt: expediente.actualizadoEn,
              status: 'valid',
            }
          : null,
        month2: p?.pasos.estadosCuenta.archivos[1]?.doc
          ? {
              name: p.pasos.estadosCuenta.archivos[1].doc.nombre || 'EdoCta_Mes2.pdf',
              size: p.pasos.estadosCuenta.archivos[1].doc.tamano || '2.1 MB',
              uploadedAt: expediente.actualizadoEn,
              status: 'valid',
            }
          : null,
        month3: p?.pasos.estadosCuenta.archivos[2]?.doc
          ? {
              name: p.pasos.estadosCuenta.archivos[2].doc.nombre || 'EdoCta_Mes3.pdf',
              size: p.pasos.estadosCuenta.archivos[2].doc.tamano || '2.3 MB',
              uploadedAt: expediente.actualizadoEn,
              status: 'valid',
            }
          : null,
      },
      internalFinancialsDoc: p?.pasos.estadosFinancieros.archivoFinanciero
        ? {
            name: p.pasos.estadosFinancieros.archivoFinanciero.nombre || (isPersonaFisica ? 'Declaracion_Anual.pdf' : 'EstadosFinancieros.xlsx'),
            size: p.pasos.estadosFinancieros.archivoFinanciero.tamano || (isPersonaFisica ? '1.8 MB' : '3.2 MB'),
            uploadedAt: expediente.actualizadoEn,
            status: 'valid',
          }
        : null,
      financialDocType: isPersonaFisica ? 'declaracion_anual' : 'balance_general',
      hasCertifiedAccountant: !isPersonaFisica,
      accountantCedula: !isPersonaFisica ? (p?.pasos.estadosFinancieros.cedulaContador || 'CP-7819204') : undefined,
      fiscalYear: p?.pasos.estadosFinancieros.ejercicioFiscal || (isPersonaFisica ? 'Ejercicio Fiscal 2025' : 'Corte Parcial 2026'),
    };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalSteps = 5;

  const syncToStore = (stepNum: number, updatedState: OnboardingState) => {
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const isFinished = stepNum >= 6;
    const calcPercentage = isFinished ? 100 : Math.round((Math.max(stepNum, 0) / totalSteps) * 100);

    const updatedOnboarding = {
      pasoActual: stepNum,
      totalPasos: 5,
      porcentaje: calcPercentage,
      ultimoAcceso: formattedDate,
      dispositivo: 'Escritorio' as 'Móvil' | 'Escritorio',
      pasos: {
        identificacion: {
          completado: Boolean(updatedState.ineFront && updatedState.ineBack) || stepNum > 1,
          tipoDocumento: 'INE Vigente',
          validadoOcr: true,
          ineAnverso: updatedState.ineFront
            ? {
                cargado: true,
                nombre: updatedState.ineFront.name,
                tamano: updatedState.ineFront.size,
                actualizadoEn: formattedDate,
                status: 'valido' as const,
              }
            : undefined,
          ineReverso: updatedState.ineBack
            ? {
                cargado: true,
                nombre: updatedState.ineBack.name,
                tamano: updatedState.ineBack.size,
                actualizadoEn: formattedDate,
                status: 'valido' as const,
              }
            : undefined,
        },
        domicilio: {
          completado: Boolean(updatedState.addressDoc) || stepNum > 2,
          tipo: (updatedState.addressType.toUpperCase() as any) || 'CFE',
          antiguedadMeses: 1,
          comprobante: updatedState.addressDoc
            ? {
                cargado: true,
                nombre: updatedState.addressDoc.name,
                tamano: updatedState.addressDoc.size,
                actualizadoEn: formattedDate,
                status: 'valido' as const,
              }
            : undefined,
        },
        estadosCuenta: {
          completado:
            Boolean(
              updatedState.bankStatements.month1 &&
                updatedState.bankStatements.month2 &&
                updatedState.bankStatements.month3
            ) || stepNum > 4,
          mesesCargados: [
            updatedState.bankStatements.month1,
            updatedState.bankStatements.month2,
            updatedState.bankStatements.month3,
          ].filter(Boolean).length || (stepNum > 4 ? 3 : stepNum === 4 ? 2 : 0),
          totalRequeridos: 3,
          archivos: [
            {
              mes: 'Agosto 2026',
              banco: 'BBVA Bancomer',
              doc: updatedState.bankStatements.month1
                ? {
                    cargado: true,
                    nombre: updatedState.bankStatements.month1.name,
                    tamano: updatedState.bankStatements.month1.size,
                    status: 'valido' as const,
                  }
                : undefined,
            },
            {
              mes: 'Julio 2026',
              banco: 'BBVA Bancomer',
              doc: updatedState.bankStatements.month2
                ? {
                    cargado: true,
                    nombre: updatedState.bankStatements.month2.name,
                    tamano: updatedState.bankStatements.month2.size,
                    status: 'valido' as const,
                  }
                : undefined,
            },
            {
              mes: 'Junio 2026',
              banco: 'BBVA Bancomer',
              doc: updatedState.bankStatements.month3
                ? {
                    cargado: true,
                    nombre: updatedState.bankStatements.month3.name,
                    tamano: updatedState.bankStatements.month3.size,
                    status: 'valido' as const,
                  }
                : undefined,
            },
          ],
        },
        estadosFinancieros: {
          completado:
            Boolean(updatedState.internalFinancialsDoc && updatedState.buroConsent) || isFinished,
          ejercicioFiscal: updatedState.fiscalYear,
          cedulaContador: updatedState.accountantCedula,
          autorizacionBuro: updatedState.buroConsent,
          firmaBuroTimestamp: formattedDate,
          archivoFinanciero: updatedState.internalFinancialsDoc
            ? {
                cargado: true,
                nombre: updatedState.internalFinancialsDoc.name,
                tamano: updatedState.internalFinancialsDoc.size,
                status: 'valido' as const,
              }
            : undefined,
        },
      },
    };

    updateExpediente({
      ...expediente,
      estado: isFinished ? 'esperando_aprobacion' : stepNum >= 4 ? 'extrayendo' : 'enlace_enviado',
      actualizadoEn: formattedDate,
      onboardingProgress: updatedOnboarding,
    });
  };

  const canProceed = () => {
    switch (state.currentStep) {
      case 0:
        return true;
      case 1:
        return Boolean(state.ineFront && state.ineBack);
      case 2:
        return Boolean(state.addressDoc);
      case 3:
        return Boolean(state.siecKey && state.siecKey.trim().length >= 4) || state.satValidated;
      case 4:
        return Boolean(
          state.bankStatements.month1 &&
            state.bankStatements.month2 &&
            state.bankStatements.month3
        );
      case 5:
        return Boolean(state.internalFinancialsDoc && state.buroConsent);
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (state.currentStep < 6) {
      const next = state.currentStep + 1;
      const updatedState = { ...state, currentStep: next };
      setState(updatedState);
      syncToStore(next, updatedState);

      if (next === 6) {
        handleCompleteOnboarding();
      }
    }
  };

  const goToPrevStep = () => {
    if (state.currentStep > 0) {
      const prevStep = state.currentStep - 1;
      const updatedState = { ...state, currentStep: prevStep };
      setState(updatedState);
      syncToStore(prevStep, updatedState);
    }
  };

  const handleCompleteOnboarding = () => {
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const mockSummary = expediente.resumen || {
      cfdiEmitidos: isPersonaFisica ? 312 : 842,
      cfdiRecibidos: isPersonaFisica ? 186 : 578,
      totalFacturado: isPersonaFisica ? '$2,850,000 MXN' : '$18,420,890 MXN',
      opinionCumplimiento: 'POSITIVA' as const,
      scoreSolvencia: isPersonaFisica ? 784 : 818,
      categoriaRiesgo: 'Bajo Riesgo (AAA)' as const,
      inconsistenciasDetectadas: 0,
      fechaExtraccion: formattedDate,
    };

    const updatedTimeline = [
      ...expediente.timeline.map((t) => ({ ...t, estado: 'done' as const })),
      {
        id: `t-${Date.now()}-docs`,
        timestamp: formattedDate,
        titulo: 'Documentación entregada para evaluación',
        descripcion: isPersonaFisica
          ? 'Se recibieron los 5 requisitos (INE titular, Domicilio particular, SAT CIEC, Cuentas bancarias e Ingresos) y autorización de Buró.'
          : 'Se recibieron los 5 requisitos (INE representante, Domicilio fiscal, SAT CIEC, Cuentas bancarias y Financieros) y autorización de Buró.',
        estado: 'done' as const,
      },
      {
        id: `t-${Date.now()}-approval`,
        timestamp: formattedDate,
        titulo: 'En espera de dictamen crediticio',
        descripcion: 'Extracción completada. Expediente turnado a la mesa de dictamen de Apoyando Ideas.',
        estado: 'active' as const,
      },
    ];

    updateExpediente({
      ...expediente,
      estado: 'esperando_aprobacion',
      actualizadoEn: formattedDate,
      resumen: mockSummary,
      timeline: updatedTimeline,
    });
  };

  const handleAutoFillAll = () => {
    const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const filledState: OnboardingState = {
      currentStep: 5,
      buroConsent: true,
      buroSignature: 'data:image/png;base64,demoSignatureSample',
      signatureType: 'draw',
      typedSignatureName: expediente.contacto.nombre,
      buroConsentDate: nowTime,
      ineFront: {
        name: `INE_Anverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`,
        size: '1.4 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
      ineBack: {
        name: `INE_Reverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`,
        size: '1.2 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
      addressDoc: {
        name: `Recibo_CFE_${expediente.empresa.rfc}.pdf`,
        size: '1.6 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
      addressType: 'cfe',
      siecKey: 'LucasSAT2026!',
      satValidated: true,
      bankStatements: {
        month1: {
          name: 'EdoCta_Agosto2026_BBVA.pdf',
          size: '2.4 MB',
          uploadedAt: nowTime,
          status: 'valid',
        },
        month2: {
          name: 'EdoCta_Julio2026_BBVA.pdf',
          size: '2.1 MB',
          uploadedAt: nowTime,
          status: 'valid',
        },
        month3: {
          name: 'EdoCta_Junio2026_BBVA.pdf',
          size: '2.3 MB',
          uploadedAt: nowTime,
          status: 'valid',
        },
      },
      internalFinancialsDoc: {
        name: isPersonaFisica ? `Declaracion_Anual_${expediente.empresa.rfc}.pdf` : `Estados_Financieros_${expediente.empresa.rfc}.xlsx`,
        size: isPersonaFisica ? '1.8 MB' : '3.2 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
      financialDocType: isPersonaFisica ? 'declaracion_anual' : 'balance_general',
      hasCertifiedAccountant: !isPersonaFisica,
      accountantCedula: !isPersonaFisica ? 'CP-7819204' : undefined,
      fiscalYear: isPersonaFisica ? 'Ejercicio Fiscal 2025' : 'Cierre Anual 2025',
    };

    setState(filledState);
    syncToStore(5, filledState);

    setToastMessage(isPersonaFisica ? 'Datos de Persona Física cargados' : 'Datos de Empresa cargados');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const progressPercentage =
    state.currentStep === 0
      ? 0
      : state.currentStep === 6
      ? 100
      : Math.round((state.currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-zinc-950 font-sans selection:bg-teal-500/20 selection:text-teal-950">
      
      {/* Floating Mini Bubble for Sample Fill */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs shadow-xl flex items-center gap-2 font-medium border border-zinc-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleAutoFillAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95 border border-zinc-700"
          title="Llenar muestra de prueba"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          <span>Llenar muestra</span>
        </button>
      </div>

      {/* Left Sidebar (Desktop View) with Lucas Official Branding */}
      <aside className="hidden lg:flex flex-col justify-between w-[340px] xl:w-[380px] shrink-0 border-r border-zinc-200/90 bg-zinc-50/70 p-8 xl:p-10 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Brand Logo & Folio */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-zinc-950">
                Lucas
              </span>
              <span className="text-zinc-300">/</span>
              <span className="text-xs font-semibold text-teal-800">
                Apoyando Ideas
              </span>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-white border border-teal-100/90 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block font-mono">
                  {isPersonaFisica ? 'Persona física solicitante' : 'Empresa solicitante'}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  isPersonaFisica ? 'bg-amber-50 text-amber-900 border border-amber-200/80' : 'bg-teal-50 text-teal-900 border border-teal-200/80'
                }`}>
                  {isPersonaFisica ? <User className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                  {isPersonaFisica ? 'PF' : 'PM'}
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-900 truncate">
                {expediente.empresa.razonSocial}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                <span>RFC: {expediente.empresa.rfc}</span>
                <span>•</span>
                <span className="text-teal-800 font-semibold">{expediente.folio}</span>
              </div>
              {isPersonaFisica && expediente.empresa.ocupacion && (
                <div className="pt-1 border-t border-zinc-100 text-[10px] text-zinc-500 truncate">
                  Actividad: <strong className="text-zinc-700 font-medium">{expediente.empresa.ocupacion}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3 px-1 font-mono">
              Pasos requeridos
            </p>
            <nav className="space-y-1.5">
              {stepsNav.map((step) => {
                const isCompleted = state.currentStep > step.id;
                const isCurrent = state.currentStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-teal-900 text-white shadow-xs'
                        : isCompleted
                        ? 'text-zinc-900 bg-white/70 border border-zinc-200/60'
                        : 'text-zinc-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-white text-teal-950'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.id + 1}
                    </div>
                    <span className="truncate">{step.title}</span>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Note with Lucas Security Assurance */}
        <div className="text-[11px] text-zinc-400 leading-normal border-t border-zinc-200/80 pt-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Información protegida con estricta confidencialidad crediticia.</span>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-sm text-zinc-950">Lucas</span>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-semibold text-teal-800 shrink-0">Apoyando Ideas</span>
          <span className="text-zinc-300 hidden sm:inline">•</span>
          <span className="text-xs text-zinc-500 truncate max-w-[120px] hidden sm:inline">
            {expediente.empresa.razonSocial}
          </span>
        </div>
        {state.currentStep > 0 && state.currentStep < 6 && (
          <span className="text-xs font-medium text-teal-900 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-mono shrink-0">
            Paso {state.currentStep} de {totalSteps}
          </span>
        )}
      </div>

      {/* Mobile Progress Bar */}
      {state.currentStep > 0 && state.currentStep < 6 && (
        <div className="lg:hidden w-full bg-zinc-100 h-1">
          <div
            className="h-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Right Canvas / Main Content */}
      <main className="flex-1 flex flex-col justify-between min-h-screen lg:min-h-0">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {state.currentStep === 0 && (
                <StepWelcome
                  expediente={expediente}
                  onStart={() => setState((prev) => ({ ...prev, currentStep: 1 }))}
                />
              )}

              {state.currentStep === 1 && (
                <StepIdentity
                  expediente={expediente}
                  ineFront={state.ineFront}
                  ineBack={state.ineBack}
                  onFrontChange={(doc) => setState((prev) => ({ ...prev, ineFront: doc }))}
                  onBackChange={(doc) => setState((prev) => ({ ...prev, ineBack: doc }))}
                />
              )}

              {state.currentStep === 2 && (
                <StepAddress
                  expediente={expediente}
                  addressDoc={state.addressDoc}
                  addressType={state.addressType}
                  onDocChange={(doc) => setState((prev) => ({ ...prev, addressDoc: doc }))}
                  onTypeChange={(type) => setState((prev) => ({ ...prev, addressType: type }))}
                />
              )}

              {state.currentStep === 3 && (
                <StepSatCredentials
                  expediente={expediente}
                  siecKey={state.siecKey}
                  satValidated={state.satValidated}
                  onSiecKeyChange={(key) => setState((prev) => ({ ...prev, siecKey: key }))}
                  onSatValidatedChange={(val) => setState((prev) => ({ ...prev, satValidated: val }))}
                />
              )}

              {state.currentStep === 4 && (
                <StepBankStatements
                  expediente={expediente}
                  statements={state.bankStatements}
                  onStatementsChange={(statements) =>
                    setState((prev) => ({ ...prev, bankStatements: statements }))
                  }
                />
              )}

              {state.currentStep === 5 && (
                <StepInternalFinancials
                  expediente={expediente}
                  internalDoc={state.internalFinancialsDoc}
                  hasCertifiedAccountant={state.hasCertifiedAccountant}
                  accountantCedula={state.accountantCedula}
                  fiscalYear={state.fiscalYear}
                  buroConsent={state.buroConsent}
                  onDocChange={(doc) =>
                    setState((prev) => ({ ...prev, internalFinancialsDoc: doc }))
                  }
                  onHasCertifiedChange={(val) =>
                    setState((prev) => ({ ...prev, hasCertifiedAccountant: val }))
                  }
                  onCedulaChange={(val) =>
                    setState((prev) => ({ ...prev, accountantCedula: val }))
                  }
                  onFiscalYearChange={(val) =>
                    setState((prev) => ({ ...prev, fiscalYear: val }))
                  }
                  onConsentChange={(val) =>
                    setState((prev) => ({ ...prev, buroConsent: val }))
                  }
                />
              )}

              {state.currentStep === 6 && (
                <StepSuccess
                  expediente={expediente}
                  state={state}
                  onReturnToDashboard={() => router.push(`/expedientes/${expediente.id}`)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Buttons (Steps 1 to 5) */}
        {state.currentStep > 0 && state.currentStep < 6 && (
          <div className="border-t border-zinc-200 bg-white/95 backdrop-blur-xs p-4 sm:px-8 xl:px-12 sticky bottom-0 z-20">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
                className="text-xs font-medium px-4 py-2.5 border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg cursor-pointer"
              >
                Atrás
              </Button>

              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!canProceed()}
                className={`text-xs font-semibold px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-[0.99] ${
                  !canProceed() ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                <span>{state.currentStep === 5 ? 'Confirmar y enviar evaluación' : 'Continuar al siguiente paso'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

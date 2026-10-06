'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCw,
  ShieldCheck,
  XCircle,
  FileCheck2,
  Sparkles,
  X,
} from 'lucide-react';

import { Header } from '@/components/dashboard/header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { getProductBadgeInfo } from '@/components/dashboard/expedientes-table';
import { ClientPortalModal } from '@/components/dashboard/client-portal-modal';
import { CreditExpertChat } from '@/components/expediente/credit-expert-chat';
import { CreditDecisionModel } from '@/components/expediente/credit-decision-model';
import { ExtractionStepper } from '@/components/expediente/extraction-stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSingleExpediente } from '@/lib/expedientes-store';
import { ScrapedDataSummary, OnboardingStepsProgress } from '@/lib/types';

export default function ExpedienteDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const { expediente, isLoaded, updateExpediente } = useSingleExpediente(id);

  const isExtractionFinished = [
    'esperando_aprobacion',
    'credito_aprobado',
    'credito_rechazado',
    'completado',
  ].includes(expediente?.estado || '');

  const isAprobado = expediente?.estado === 'credito_aprobado' || expediente?.estado === 'completado';
  const isAprobadoIA = expediente?.estado === 'aprobado_ia';
  const isRechazadoIA = expediente?.estado === 'rechazado_ia';
  const isEsperandoAprobacion =
    expediente?.estado === 'esperando_aprobacion' ||
    expediente?.estado === 'aprobado_ia' ||
    expediente?.estado === 'rechazado_ia';
  const isRechazado = expediente?.estado === 'credito_rechazado';

  // Strictly 2 tabs: 'onboarding' and 'analisis'
  const [activeTab, setActiveTab] = React.useState<'onboarding' | 'analisis'>('onboarding');

  // Track if default tab has been initialized for this expediente
  const hasInitializedTab = React.useRef(false);

  React.useEffect(() => {
    if (expediente && !hasInitializedTab.current) {
      if (
        [
          'esperando_aprobacion',
          'aprobado_ia',
          'rechazado_ia',
          'credito_aprobado',
          'credito_rechazado',
          'completado',
        ].includes(expediente.estado)
      ) {
        setActiveTab('analisis');
      } else {
        setActiveTab('onboarding');
      }
      hasInitializedTab.current = true;
    }
  }, [expediente]);

  // Modal state for client onboarding simulator
  const [isClientPortalOpen, setIsClientPortalOpen] = React.useState(false);
  const [simulatorInitialStep, setSimulatorInitialStep] = React.useState<number>(0);
  const [copiedLink, setCopiedLink] = React.useState(false);

  // Link copy helper
  const handleCopyLink = () => {
    if (!expediente) return;
    const url = `https://portal.apoyandoideas.com/connect/${expediente.tokenAcceso}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenClientPortal = (step?: number) => {
    setSimulatorInitialStep(step ?? (expediente?.onboardingProgress?.pasoActual || 1));
    setIsClientPortalOpen(true);
  };

  const isPF = (expediente?.empresa.tipoPersona || (expediente?.empresa.rfc.length === 13 ? 'persona_fisica' : 'persona_moral')) === 'persona_fisica';

  // Handler: When client extraction finishes in the interactive simulator
  const handleExtractionFinished = (expedienteId: string) => {
    if (!expediente) return;

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const mockSummary: ScrapedDataSummary = {
      cfdiEmitidos: isPF ? 312 : 842,
      cfdiRecibidos: isPF ? 186 : 578,
      totalFacturado: isPF ? '$1,524,000 MXN' : '$18,420,890 MXN',
      opinionCumplimiento: 'POSITIVA',
      scoreSolvencia: isPF ? 784 : 818,
      categoriaRiesgo: 'Bajo Riesgo (AAA)',
      inconsistenciasDetectadas: 0,
      fechaExtraccion: formattedDate,
    };

    const completedOnboarding: OnboardingStepsProgress = {
      pasoActual: 5,
      totalPasos: 4,
      porcentaje: 100,
      ultimoAcceso: formattedDate,
      dispositivo: expediente.onboardingProgress?.dispositivo || 'Escritorio',
      pasos: {
        identificacion: {
          completado: true,
          tipoDocumento: 'INE Vigente',
          validadoOcr: true,
          ineAnverso: {
            cargado: true,
            nombre: `INE_Anverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`,
            tamano: '1.4 MB',
            actualizadoEn: formattedDate,
            status: 'valido',
          },
          ineReverso: {
            cargado: true,
            nombre: `INE_Reverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`,
            tamano: '1.2 MB',
            actualizadoEn: formattedDate,
            status: 'valido',
          },
        },
        domicilio: {
          completado: true,
          tipo: 'CFE',
          antiguedadMeses: 1,
          comprobante: {
            cargado: true,
            nombre: `Recibo_CFE_${expediente.empresa.rfc}.pdf`,
            tamano: '1.6 MB',
            actualizadoEn: formattedDate,
            status: 'valido',
          },
        },
        estadosCuenta: {
          completado: true,
          mesesCargados: 3,
          totalRequeridos: 3,
          archivos: [
            {
              mes: 'Agosto 2026',
              banco: 'BBVA Bancomer',
              doc: {
                cargado: true,
                nombre: 'EdoCta_Agosto2026_BBVA.pdf',
                tamano: '2.4 MB',
                status: 'valido',
              },
            },
            {
              mes: 'Julio 2026',
              banco: 'BBVA Bancomer',
              doc: {
                cargado: true,
                nombre: 'EdoCta_Julio2026_BBVA.pdf',
                tamano: '2.1 MB',
                status: 'valido',
              },
            },
            {
              mes: 'Junio 2026',
              banco: 'BBVA Bancomer',
              doc: {
                cargado: true,
                nombre: 'EdoCta_Junio2026_BBVA.pdf',
                tamano: '2.3 MB',
                status: 'valido',
              },
            },
          ],
        },
        estadosFinancieros: {
          completado: true,
          ejercicioFiscal: isPF ? 'Ejercicio Fiscal 2025' : 'Cierre Anual 2025',
          cedulaContador: isPF ? undefined : 'CP-7819204',
          autorizacionBuro: true,
          firmaBuroTimestamp: formattedDate,
          archivoFinanciero: {
            cargado: true,
            nombre: isPF ? `Declaracion_Anual_${expediente.empresa.rfc}.pdf` : `Estados_Financieros_${expediente.empresa.rfc}.xlsx`,
            tamano: isPF ? '1.8 MB' : '3.2 MB',
            status: 'valido',
          },
        },
      },
    };

    const score = mockSummary.scoreSolvencia || (isPF ? 784 : 818);
    const aiStatus = score >= 700 ? 'aprobado_ia' : 'rechazado_ia';

    updateExpediente({
      ...expediente,
      estado: aiStatus,
      actualizadoEn: formattedDate,
      resumen: mockSummary,
      onboardingProgress: completedOnboarding,
      timeline: [
        ...expediente.timeline.map((t) => ({ ...t, estado: 'done' as const })),
        {
          id: `t-${Date.now()}-client`,
          timestamp: formattedDate,
          titulo: 'Expediente digital completado por el cliente',
          descripcion: isPF
            ? 'Documentos INE titular, CFE particular, 3 Bancos y Declaración SAT recibidos. Consulta de Buró autorizada.'
            : 'Documentos INE representante, CFE fiscal, 3 Bancos y Financieros recibidos. Autorización de Buró firmada.',
          estado: 'done',
        },
        {
          id: `t-${Date.now()}-approval`,
          timestamp: formattedDate,
          titulo: score >= 700 ? 'Aprobado por Modelo IA' : 'Rechazado por Modelo IA',
          descripcion: `Score de solvencia calculado en ${score}/850. Veredicto del modelo emitido automáticamente.`,
          estado: 'active',
        },
      ],
    });

    // Automatically transition to the Análisis tab
    setActiveTab('analisis');
  };

  // Fast shortcut to mark extraction completed
  const handleDirectComplete = () => {
    if (!expediente) return;
    handleExtractionFinished(expediente.id);
  };

  // Handler: Approve Credit
  const handleApproveCredit = () => {
    if (!expediente) return;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const monto = expediente.empresa.montoSolicitado || (isPF ? '$450,000 MXN' : '$3,500,000 MXN');

    updateExpediente({
      ...expediente,
      estado: 'credito_aprobado',
      actualizadoEn: formattedDate,
      dictamen: {
        resultado: 'aprobado',
        fechaDictamen: formattedDate,
        autorizadoPor: isPF ? 'Comité de Crédito Personal e Individual' : 'Comité de Riesgos y Crédito PYME',
        montoAutorizado: monto,
        tasaAutorizada: isPF ? '19.5% Anual Fija' : '17.8% Anual Fija',
        plazoAutorizado: isPF ? '24 Meses' : '24 Meses',
        condiciones: isPF
          ? [
              `Firma de pagaré individual por ${expediente.contacto.nombre} (Titular)`,
              'Domiciliación de cuotas mensuales a cuenta bancaria BBVA Bancomer',
              'Comprobación continua de situación fiscal positiva ante el SAT',
            ]
          : [
              `Ratificación de obligado solidario por ${expediente.contacto.nombre}`,
              'Póliza de seguro de cobertura amplia sobre activos adquiridos',
              'Domiciliación de pagos mensuales vía SPEI en cuenta autorizada',
            ],
        notas: isPF
          ? 'Dictamen favorable emitido tras validación de capacidad de servicio de deuda (DTI 23.6%) e historial de Buró intachable.'
          : 'Dictamen favorable emitido tras validación de capacidad de servicio de la deuda y cumplimiento tributario 100% positivo.',
      },
      timeline: [
        ...expediente.timeline.map((t) => ({ ...t, estado: 'done' as const })),
        {
          id: `t-${Date.now()}-approved`,
          timestamp: formattedDate,
          titulo: 'Crédito Aprobado por Comité',
          descripcion: `Línea de ${monto} autorizada a 24 meses (${isPF ? '19.5%' : '17.8%'} anual fija) bajo folio ${expediente.folio}.`,
          estado: 'done',
        },
      ],
    });
  };

  // Handler: Reject Credit
  const handleRejectCredit = () => {
    if (!expediente) return;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    updateExpediente({
      ...expediente,
      estado: 'credito_rechazado',
      actualizadoEn: formattedDate,
      dictamen: {
        resultado: 'rechazado',
        fechaDictamen: formattedDate,
        autorizadoPor: isPF ? 'Comité de Crédito Personal e Individual' : 'Comité de Riesgos y Crédito PYME',
        motivoRechazo: isPF
          ? 'Capacidad de endeudamiento mensual excedida o score de Buró por debajo de la política mínima.'
          : 'Capacidad de apalancamiento insuficiente para el monto solicitado o exceso de concentración de clientes.',
        notas: isPF
          ? 'Se sugiere al solicitante reestructurar la solicitud a un monto menor o incorporar un coacreditado.'
          : 'Se sugiere al solicitante reestructurar la solicitud a un monto menor o incorporar un obligado solidario con respaldo patrimonial.',
      },
      timeline: [
        ...expediente.timeline.map((t) => ({ ...t, estado: 'done' as const })),
        {
          id: `t-${Date.now()}-rejected`,
          timestamp: formattedDate,
          titulo: 'Solicitud de Crédito Declinada',
          descripcion: 'El expediente no cumplió con los parámetros mínimos de holgura operativa.',
          estado: 'done',
        },
      ],
    });
  };

  // Handler: Reopen to pending approval
  const handleReopenToPending = () => {
    if (!expediente) return;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    updateExpediente({
      ...expediente,
      estado: 'esperando_aprobacion',
      actualizadoEn: formattedDate,
    });
  };

  // Simulate client advancing to next step
  const handleSimulateStepAdvance = () => {
    if (!expediente) return;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const curPaso = expediente.onboardingProgress?.pasoActual ?? 1;
    const nextPaso = curPaso + 1;

    if (nextPaso >= 5) {
      handleDirectComplete();
      return;
    }

    const stepTitles = [
      'Bienvenida',
      'Paso 1: Identificación Oficial (INE) cargada y validada',
      'Paso 2: Comprobante de Domicilio CFE validado',
      'Paso 3: 3 Estados de Cuenta Bancarios conciliados',
      'Paso 4: Estados Financieros y Firma de Buró registrados',
    ];

    const updatedTimeline = [
      ...expediente.timeline,
      {
        id: `t-${Date.now()}`,
        timestamp: formattedDate,
        titulo: stepTitles[curPaso] || `Paso ${curPaso} completado por el cliente`,
        descripcion: `El cliente avanzó al Paso ${nextPaso} del formulario digital.`,
        estado: 'done' as const,
      },
    ];

    const prevPasos = expediente.onboardingProgress?.pasos;

    updateExpediente({
      ...expediente,
      estado: nextPaso >= 3 ? 'extrayendo' : 'enlace_enviado',
      actualizadoEn: formattedDate,
      timeline: updatedTimeline,
      onboardingProgress: {
        pasoActual: nextPaso,
        totalPasos: 4,
        porcentaje: Math.round((nextPaso / 4) * 100),
        ultimoAcceso: formattedDate,
        dispositivo: expediente.onboardingProgress?.dispositivo || 'Escritorio',
        pasos: {
          identificacion: {
            completado: true,
            tipoDocumento: 'INE Vigente',
            validadoOcr: true,
            ineAnverso: {
              cargado: true,
              nombre: `INE_Anverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`,
              tamano: '1.4 MB',
              actualizadoEn: formattedDate,
              status: 'valido',
            },
            ineReverso: {
              cargado: true,
              nombre: `INE_Reverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`,
              tamano: '1.2 MB',
              actualizadoEn: formattedDate,
              status: 'valido',
            },
          },
          domicilio: {
            completado: nextPaso > 2,
            tipo: 'CFE',
            antiguedadMeses: 1,
            comprobante:
              nextPaso > 2
                ? {
                    cargado: true,
                    nombre: `Recibo_CFE_${expediente.empresa.rfc}.pdf`,
                    tamano: '1.6 MB',
                    actualizadoEn: formattedDate,
                    status: 'valido',
                  }
                : prevPasos?.domicilio.comprobante,
          },
          estadosCuenta: {
            completado: nextPaso > 3,
            mesesCargados: nextPaso > 3 ? 3 : nextPaso === 3 ? 2 : 0,
            totalRequeridos: 3,
            archivos:
              nextPaso > 3
                ? [
                    {
                      mes: 'Agosto 2026',
                      banco: 'BBVA Bancomer',
                      doc: {
                        cargado: true,
                        nombre: 'EdoCta_Agosto2026_BBVA.pdf',
                        tamano: '2.4 MB',
                        status: 'valido',
                      },
                    },
                    {
                      mes: 'Julio 2026',
                      banco: 'BBVA Bancomer',
                      doc: {
                        cargado: true,
                        nombre: 'EdoCta_Julio2026_BBVA.pdf',
                        tamano: '2.1 MB',
                        status: 'valido',
                      },
                    },
                    {
                      mes: 'Junio 2026',
                      banco: 'BBVA Bancomer',
                      doc: {
                        cargado: true,
                        nombre: 'EdoCta_Junio2026_BBVA.pdf',
                        tamano: '2.3 MB',
                        status: 'valido',
                      },
                    },
                  ]
                : prevPasos?.estadosCuenta.archivos || [],
          },
          estadosFinancieros: {
            completado: nextPaso > 4,
            ejercicioFiscal: 'Cierre Anual 2025',
            cedulaContador: 'CP-7819204',
            autorizacionBuro: true,
            firmaBuroTimestamp: formattedDate,
            archivoFinanciero:
              nextPaso > 4
                ? {
                    cargado: true,
                    nombre: `Estados_Financieros_${expediente.empresa.rfc}.xlsx`,
                    tamano: '3.2 MB',
                    status: 'valido',
                  }
                : prevPasos?.estadosFinancieros.archivoFinanciero,
          },
        },
      },
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-500 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            Cargando expediente...
          </div>
        </main>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl w-full mx-auto p-8 text-center space-y-4 pt-20">
          <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto" />
          <h1 className="text-xl font-bold text-zinc-900">Expediente no encontrado</h1>
          <p className="text-sm text-zinc-500">
            No se encontró información para el identificador especificado.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Volver a la lista de expedientes
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/40 flex flex-col font-sans">
      <Header />

      <main
        className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 transition-all duration-300 ${
          activeTab === 'analisis' && isExtractionFinished ? 'max-w-7xl' : 'max-w-5xl'
        }`}
      >
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Expedientes</span>
          </Link>
        </div>

        {/* Expediente Overview Banner */}
        <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {expediente.folio}
                </span>
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  isPF ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-teal-50 text-teal-900 border-teal-200'
                }`}>
                  {isPF ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {isPF ? 'Persona Física (PF)' : 'Persona Moral (PM)'}
                </span>
                {(() => {
                  const prodBadge = getProductBadgeInfo(expediente.empresa.tipoProducto);
                  const ProdIcon = prodBadge.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${prodBadge.className}`}>
                      <ProdIcon className="w-3 h-3" />
                      {prodBadge.label}
                    </span>
                  );
                })()}
                <span className="text-xs font-mono text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                  RFC: {expediente.empresa.rfc}
                </span>
                {isPF && expediente.empresa.curp && (
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                    CURP: {expediente.empresa.curp}
                  </span>
                )}
                <StatusBadge status={expediente.estado} />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
                {expediente.empresa.razonSocial}
              </h1>

              <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                <span className="flex items-center gap-1">
                  {isPF ? <User className="w-3.5 h-3.5 text-zinc-400" /> : <Building2 className="w-3.5 h-3.5 text-zinc-400" />}
                  {expediente.empresa.sector}
                </span>
                {isPF && expediente.empresa.ocupacion && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-700 font-medium">
                      Ocupación: {expediente.empresa.ocupacion}
                    </span>
                  </>
                )}
                {expediente.empresa.destinoDetalle && (
                  <>
                    <span>•</span>
                    <span className="text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                      {expediente.empresa.destinoDetalle}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Creado: {expediente.creadoEn}
                </span>
                {expediente.empresa.montoSolicitado && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-zinc-900">
                      Monto: {expediente.empresa.montoSolicitado}
                    </span>
                  </>
                )}
                {expediente.empresa.plazoMeses && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-zinc-700">
                      Plazo: {expediente.empresa.plazoMeses} meses
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Header fast approval buttons if waiting for approval */}
            {isEsperandoAprobacion && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRejectCredit}
                  className="text-xs h-8 text-zinc-700 border-zinc-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  onClick={handleApproveCredit}
                  className="text-xs h-8 bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs font-semibold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Marcar como aprobado
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Strictly 2 Tabs: [Onboarding del cliente, Análisis] */}
        <div className="flex items-center border-b border-zinc-200 space-x-6 text-sm">
          {/* TAB: Onboarding del cliente */}
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`pb-3 font-medium transition-all relative ${
              activeTab === 'onboarding'
                ? 'text-zinc-950 font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Onboarding del cliente</span>
            {activeTab === 'onboarding' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"
              />
            )}
          </button>

          {/* TAB: Análisis */}
          <button
            onClick={() => setActiveTab('analisis')}
            className={`pb-3 font-medium transition-all relative flex items-center gap-1.5 ${
              activeTab === 'analisis'
                ? 'text-zinc-950 font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Análisis Crediticio</span>
            {isExtractionFinished && (
              <span
                className={`w-2 h-2 rounded-full ${
                  isAprobado
                    ? 'bg-emerald-500'
                    : isEsperandoAprobacion
                    ? 'bg-indigo-500 animate-pulse'
                    : isRechazado
                    ? 'bg-rose-500'
                    : 'bg-teal-500'
                }`}
              />
            )}
            {activeTab === 'analisis' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full"
              />
            )}
          </button>
        </div>

        {/* TAB CONTENT: ONBOARDING DEL CLIENTE */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            {/* Top row: Contact details & Extraction Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-900">
                      <User className="w-4 h-4 text-zinc-500" />
                      {isPF ? 'Titular Solicitante' : 'Contacto Solicitado'}
                    </CardTitle>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 uppercase">
                      Vía {expediente.contacto.metodoNotificacion}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {isPF
                      ? 'Persona física titular para la comprobación de ingresos y autorización en Buró de Crédito.'
                      : 'Persona designada para proporcionar el acceso y autorizar la extracción fiscal.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900 text-sm">{expediente.contacto.nombre}</span>
                      <span className="text-zinc-500">{isPF ? 'Titular' : expediente.contacto.puesto}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 font-mono pt-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{expediente.contacto.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 font-mono">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{expediente.contacto.telefono}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Extraction Link Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-900">
                    <ExternalLink className="w-4 h-4 text-teal-600" />
                    Enlace de Acceso del Cliente
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Enlace cifrado enviado al contacto para autorizar la conexión con el SAT.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-700 truncate">
                      https://portal.apoyandoideas.com/connect/{expediente.tokenAcceso}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="gap-1.5 text-xs h-9 px-3 shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Copiar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stepper / Dynamic Extraction Flow Component */}
            <ExtractionStepper
              expediente={expediente}
              onOpenClientPortal={handleOpenClientPortal}
              onSimulateStepAdvance={handleSimulateStepAdvance}
              onCompleteAll={handleDirectComplete}
            />
          </div>
        )}

        {/* TAB CONTENT: ANÁLISIS */}
        {activeTab === 'analisis' && (
          <div className="space-y-6">
            {!isExtractionFinished ? (
              /* State when extraction is not yet finished */
              <Card className="border-dashed border-zinc-300">
                <CardContent className="py-14 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900">
                    Análisis en espera de extracción
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Los indicadores fiscales y el modelo de decisión se calcularán automáticamente una vez que el contacto complete el proceso de extracción en el portal.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('onboarding')}
                      variant="outline"
                      className="text-xs cursor-pointer"
                    >
                      Ver flujo de Onboarding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* State when extraction is completed: Header Action Bar + 2-Column Split Layout */
              <div className="space-y-6">
                {/* Approval Action Bar based on state */}
                {isEsperandoAprobacion && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {isAprobadoIA ? (
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                        </div>
                      ) : isRechazadoIA ? (
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center shrink-0">
                          <X className="w-4 h-4 text-rose-600" />
                        </div>
                      ) : null}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {isAprobadoIA
                              ? 'Aprobado por Modelo IA'
                              : isRechazadoIA
                              ? 'Rechazado por Modelo IA'
                              : 'Dictamen pendiente'}
                          </h3>
                          {expediente.resumen?.scoreSolvencia && (
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                              Score {expediente.resumen.scoreSolvencia}/850
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {isAprobadoIA
                            ? 'El solicitante cumple con las políticas del modelo. Listo para ratificación y firma de comité.'
                            : isRechazadoIA
                            ? 'El expediente no alcanzó los umbrales mínimos del modelo de decisión.'
                            : 'Revisa los criterios cuantitativos y emite el dictamen final.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRejectCredit}
                        className="text-xs h-9 px-3.5 border-zinc-200 text-zinc-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 cursor-pointer font-medium transition-colors"
                      >
                        <X className="w-4 h-4 mr-1.5 text-zinc-400" />
                        Rechazar solicitud
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApproveCredit}
                        className="text-xs h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Marcar como aprobado
                      </Button>
                    </div>
                  </motion.div>
                )}

                {isAprobado && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-zinc-900">
                            Crédito Autorizado por Comité
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/70">
                            Línea: {expediente.dictamen?.montoAutorizado || expediente.empresa.montoSolicitado}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Dictamen emitido el {expediente.dictamen?.fechaDictamen || expediente.actualizadoEn} • {expediente.dictamen?.tasaAutorizada || '17.8% anual fija'} • {expediente.dictamen?.plazoAutorizado || '24 Meses'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReopenToPending}
                        className="text-xs h-8 border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                      >
                        Cambiar dictamen
                      </Button>
                    </div>
                  </motion.div>
                )}

                {isRechazado && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0">
                        <X className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-zinc-900">
                            Solicitud de Crédito Declinada
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium border border-rose-200/70">
                            Rechazada
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {expediente.dictamen?.motivoRechazo || 'El expediente no cumplió con las políticas crediticias.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReopenToPending}
                      className="text-xs h-8 border-zinc-200 text-zinc-700 hover:bg-zinc-50 cursor-pointer shrink-0"
                    >
                      Reconsiderar Dictamen
                    </Button>
                  </motion.div>
                )}

                {/* 2-Column Split Layout (Decision Model + Chat) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Credit Decision Model & Detailed Visual Audit */}
                  <div className="lg:col-span-7 space-y-6">
                    <CreditDecisionModel expediente={expediente} />
                  </div>

                  {/* Right Column: Experto Apoyando Ideas Chat Always Open */}
                  <div className="lg:col-span-5 lg:sticky lg:top-6">
                    <CreditExpertChat expediente={expediente} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Client Portal Modal Simulator */}
        <ClientPortalModal
          isOpen={isClientPortalOpen}
          initialStep={simulatorInitialStep}
          onClose={() => setIsClientPortalOpen(false)}
          expediente={expediente}
          onCompleted={() => handleExtractionFinished(expediente.id)}
        />
      </main>
    </div>
  );
}

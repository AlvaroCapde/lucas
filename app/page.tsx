'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Database,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  KeyRound,
  Building2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PipelineLoader } from '@/components/ui/pipeline-loader';
import { JsonViewer } from '@/components/ui/json-viewer';

import { Header } from '@/components/dashboard/header';
import { MetricsBar } from '@/components/dashboard/metrics-bar';
import { ExpedientesTable } from '@/components/dashboard/expedientes-table';
import { CreateExpedienteModal } from '@/components/dashboard/create-expediente-modal';
import { ClientPortalModal } from '@/components/dashboard/client-portal-modal';

import { useExpedientes } from '@/lib/expedientes-store';
import { Expediente, ScrapedDataSummary } from '@/lib/types';

interface ScrapeResult {
  rfc?: string;
  searchParams?: {
    startDate?: string;
    endDate?: string;
  };
  invoices?: unknown[];
  [key: string]: unknown;
}

const tactileEase = [0.16, 1, 0.3, 1] as const;

export default function LucasDashboardPage() {
  const router = useRouter();

  // Navigation tab: 'expedientes' (Dashboard) | 'consola' (Scraper Directo)
  const [activeTab, setActiveTab] = React.useState<'expedientes' | 'consola'>('expedientes');

  // Shared Expedientes Store
  const { expedientes, addExpediente, updateExpediente } = useExpedientes();

  // Modals state
  const [clientPortalExpedienteId, setClientPortalExpedienteId] = React.useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const clientPortalExpediente = React.useMemo(
    () => expedientes.find((e) => e.id === clientPortalExpedienteId) || null,
    [expedientes, clientPortalExpedienteId]
  );

  // Notification Banner
  const [notification, setNotification] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Handler: Navigate to individual expediente page
  const handleSelectExpediente = (exp: Expediente) => {
    router.push(`/expedientes/${exp.id}`);
  };

  // Handler: Create Expediente
  const handleCreateExpediente = (newExpediente: Expediente) => {
    addExpediente(newExpediente);
    showNotification(`Expediente ${newExpediente.folio} generado y notificación enviada a ${newExpediente.contacto.nombre}.`);
  };

  // Handler: When client extraction finishes in the client portal modal
  const handleClientExtractionFinished = (expedienteId: string) => {
    const target = expedientes.find((e) => e.id === expedienteId);
    if (!target) return;

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;

    const mockSummary: ScrapedDataSummary = {
      cfdiEmitidos: 712,
      cfdiRecibidos: 536,
      totalFacturado: '$14,920,400 MXN',
      opinionCumplimiento: 'POSITIVA',
      scoreSolvencia: 805,
      categoriaRiesgo: 'Bajo Riesgo (AAA)',
      inconsistenciasDetectadas: 0,
      fechaExtraccion: formattedDate,
    };

    const score = mockSummary.scoreSolvencia || 805;
    const aiStatus = score >= 700 ? 'aprobado_ia' : 'rechazado_ia';

    updateExpediente({
      ...target,
      estado: aiStatus,
      actualizadoEn: formattedDate,
      resumen: mockSummary,
      timeline: [
        ...target.timeline.map((t) => ({ ...t, estado: 'done' as const })),
        {
          id: `t-${Date.now()}-client`,
          timestamp: formattedDate,
          titulo: 'Extracción completada por el cliente',
          descripcion: 'Credenciales CIEC verificadas en portal del SAT y comprobantes descargados.',
          estado: 'done',
        },
        {
          id: `t-${Date.now()}-eval`,
          timestamp: formattedDate,
          titulo: score >= 700 ? 'Aprobado por Modelo IA' : 'Rechazado por Modelo IA',
          descripcion: `Score de solvencia calculado en ${score}/850. Veredicto del modelo emitido automáticamente.`,
          estado: 'active',
        },
      ],
    });

    showNotification(`¡Extracción completada para ${target.folio}! Evaluado: ${score >= 700 ? 'Aprobado por modelo IA' : 'Rechazado por modelo IA'} (Score ${score}).`);
  };

  // Standalone Scraper Console State
  const [rfc, setRfc] = React.useState('TLB1904128N2');
  const [ciec, setCiec] = React.useState('DemoPassword2026!');
  const [startDate, setStartDate] = React.useState('2025-01-01');
  const [endDate, setEndDate] = React.useState('2025-12-31');

  const [loading, setLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ScrapeResult | null>(null);

  const handleRunConsoleScraper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfc || !ciec) {
      setError('RFC y CIEC son requeridos.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep('Iniciando navegador Playwright (Modo Stealth)...');

    const steps = [
      'Iniciando navegador Playwright (Modo Stealth)...',
      'Navegando al portal del SAT...',
      'Efectuando login con CIEC...',
      'Resolviendo captcha...',
      'Extrayendo metadatos de comprobantes...',
      'Procesando CFDIs y descargando JSON...',
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      currentStepIdx++;
      if (currentStepIdx < steps.length) {
        setCurrentStep(steps[currentStepIdx]);
      }
    }, 2500);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfc, ciec, startDate, endDate }),
      });

      clearInterval(interval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al ejecutar el scraper');
      }

      setResult(data);
    } catch (err: unknown) {
      clearInterval(interval);
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setCurrentStep(undefined);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* App Header */}
      <Header
        currentTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 right-6 z-50 bg-zinc-950 text-white px-4 py-2.5 rounded-xl shadow-lg border border-zinc-800 text-xs font-medium flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content View */}
      {activeTab === 'expedientes' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Section Title & Quick Create */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-950 tracking-tight">
                  Expedientes
                </h1>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Gestiona las solicitudes de información tributaria y monitorea el estado del flujo con los evaluados.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="sm:w-auto h-10 px-4 text-xs font-semibold gap-2 shadow-xs"
            >
              <span>Crear Expediente</span>
            </Button>
          </div>

          {/* Metrics KPIs */}
          <MetricsBar expedientes={expedientes} />

          {/* Expedientes Table */}
          <ExpedientesTable
            expedientes={expedientes}
            onSelectExpediente={handleSelectExpediente}
            onOpenClientPortal={(exp) => setClientPortalExpedienteId(exp.id)}
          />
        </main>
      ) : (
        /* Direct SAT Scraper Console */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-zinc-200/80 pb-4">
            <h1 className="text-xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              Consola Técnica de Extracción SAT
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ambiente de prueba directa para validar la extracción con Playwright y resolución de captchas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-teal-600" />
                    Parámetros de Extracción
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Credenciales fiscales para ejecutar el bot de scraping.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRunConsoleScraper} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">RFC del Contribuyente</label>
                      <Input
                        required
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value.toUpperCase())}
                        placeholder="TLB1904128N2"
                        className="font-mono uppercase text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">Contraseña CIEC</label>
                      <Input
                        type="password"
                        required
                        value={ciec}
                        onChange={(e) => setCiec(e.target.value)}
                        placeholder="••••••••••••"
                        className="font-mono text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-600">Fecha Inicio</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-600">Fecha Fin</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 text-xs font-semibold gap-2 mt-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Extrayendo...</span>
                        </>
                      ) : (
                        <>
                          <span>Ejecutar Extracción Directa</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b border-zinc-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Salida de Datos</CardTitle>
                    <span className="text-[11px] font-mono text-zinc-400">
                      FORMATO: JSON ESTRUCTURADO
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  {loading && (
                    <div className="py-12">
                      <PipelineLoader message={currentStep} />
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Error al extraer datos</p>
                        <p className="text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {!loading && !error && !result && (
                    <div className="text-center py-16 text-zinc-400 space-y-2">
                      <Database className="w-8 h-8 mx-auto text-zinc-300 stroke-[1.5]" />
                      <p className="text-xs">
                        Ingresa los parámetros y haz clic en &quot;Ejecutar Extracción Directa&quot; para inspeccionar el JSON.
                      </p>
                    </div>
                  )}

                  {!loading && result && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <span className="font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Extracción exitosa para {rfc}
                        </span>
                        <span className="font-mono text-[11px]">
                          {Array.isArray(result.invoices) ? result.invoices.length : 0} comprobantes
                        </span>
                      </div>
                      <JsonViewer data={result} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}

      {/* Modal para Crear Expediente */}
      <CreateExpedienteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateExpediente}
      />

      {/* Modal de Simulación del Portal del Cliente */}
      <ClientPortalModal
        expediente={clientPortalExpediente}
        isOpen={!!clientPortalExpediente}
        onClose={() => setClientPortalExpedienteId(null)}
        onExtractionFinished={handleClientExtractionFinished}
      />
    </div>
  );
}

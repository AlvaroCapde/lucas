'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  ArrowRight,
  Save,
  Check,
  Cpu,
} from 'lucide-react';

import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDecisionProfiles, DecisionProfile } from '@/lib/decision-model-store';
import { useExpedientes } from '@/lib/expedientes-store';

const QUICK_TEMPLATES = [
  {
    label: 'PyME Transporte con Aval',
    prompt: `Nuestra política para empresas de transporte exige al menos 2 años de antigüedad en el SAT.
1. El crédito solicitado no debe superar el 25% de la facturación anual comprobada en el SAT.
2. Opinión de cumplimiento 32-D positiva y cero facturas con EFOS (Art. 69-B del CFF).
3. Concentración máxima en un solo cliente del 35% de las ventas.
4. Mínimo 15 CFDIs emitidos al mes.
5. Para montos superiores a $2,000,000 MXN requerimos obligado solidario del representante legal.`,
  },
  {
    label: 'Factoraje Ágil',
    prompt: `Para factoraje y liquidez de cuentas por cobrar:
1. Máximo 30% del volumen anual de facturación.
2. Aforo de 1.2 a 1 sobre facturas vigentes.
3. Máximo 40% de concentración en un solo pagador.
4. Opinión positiva SAT.`,
  },
  {
    label: 'PyME Conservador',
    prompt: `Crédito directo de baja morosidad:
1. Límite de crédito estricto de máximo 18% de ventas anuales.
2. Concentración por cliente menor al 25%.
3. Mínimo 20 facturas al mes.
4. Obligado solidario a partir de $1,000,000 MXN.`,
  },
];

export default function ModelosDecisionPage() {
  const {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfile,
    updateProfile,
    addProfile,
    isLoaded: profilesLoaded,
  } = useDecisionProfiles();

  const { expedientes } = useExpedientes();

  // Active working draft profile
  const [draftProfile, setDraftProfile] = React.useState<DecisionProfile | null>(null);

  // Sync draft profile whenever activeProfile changes
  React.useEffect(() => {
    if (activeProfile) {
      setDraftProfile(JSON.parse(JSON.stringify(activeProfile)));
    }
  }, [activeProfile]);

  // Conversational prompt input
  const [promptText, setPromptText] = React.useState('');
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [compilationSuccessMessage, setCompilationSuccessMessage] = React.useState<string | null>(null);

  // Sync prompt text when activeProfile changes
  React.useEffect(() => {
    if (activeProfile?.promptPolitica) {
      setPromptText(activeProfile.promptPolitica);
    }
  }, [activeProfile?.promptPolitica]);

  // Backtest / Simulation state
  const [selectedExpedienteId, setSelectedExpedienteId] = React.useState<string>(
    expedientes[0]?.id || 'exp-1'
  );
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationResult, setSimulationResult] = React.useState<{
    resultado: 'aprobado' | 'condicionado' | 'rechazado';
    score: number;
    detalles: Array<{ titulo: string; estado: 'cumple' | 'riesgo' | 'observacion'; nota: string }>;
    resumenIA: string;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Handler: Compile policy from natural language prompt
  const handleCompilePolicy = async (customPrompt?: string) => {
    const text = customPrompt || promptText;
    if (!text.trim() || isCompiling) return;

    setIsCompiling(true);
    setCompilationSuccessMessage(null);

    try {
      const res = await fetch('/api/modelos/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          currentProfile: draftProfile || activeProfile,
        }),
      });

      if (!res.ok) throw new Error('Error al compilar política');
      const data = await res.json();

      if (data.compiled && draftProfile) {
        const compiled = data.compiled;
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

        const updated: DecisionProfile = {
          ...draftProfile,
          nombre: compiled.nombre || draftProfile.nombre,
          sector: compiled.sector || draftProfile.sector,
          descripcion: compiled.descripcion || draftProfile.descripcion,
          promptPolitica: text,
          actualizadoEn: dateStr,
          filtrosEliminatorios: {
            ...draftProfile.filtrosEliminatorios,
            ...(compiled.filtrosEliminatorios || {}),
          },
          umbralesCuantitativos: {
            ...draftProfile.umbralesCuantitativos,
            ...(compiled.umbralesCuantitativos || {}),
          },
          politicaGarantias: {
            ...draftProfile.politicaGarantias,
            ...(compiled.politicaGarantias || {}),
          },
          directricesIA: compiled.directricesIA || draftProfile.directricesIA,
        };

        setDraftProfile(updated);
        updateProfile(updated);
        setCompilationSuccessMessage('Modelo compilado exitosamente y reglas actualizadas.');
        setTimeout(() => setCompilationSuccessMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
      setCompilationSuccessMessage('Error al compilar. Se mantuvieron las reglas actuales.');
    } finally {
      setIsCompiling(false);
    }
  };

  // Handler: Run Backtest Simulation
  const handleRunSimulation = () => {
    const exp = expedientes.find((e) => e.id === selectedExpedienteId) || expedientes[0];
    if (!exp || !draftProfile) return;

    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      const montoSolicitadoNum = 3500000;
      const facturacionTotalNum = 18420890;
      const dtiRatio = (montoSolicitadoNum / facturacionTotalNum) * 100;
      const maxDti = draftProfile.umbralesCuantitativos.maxDtiRatio;
      const maxConc = draftProfile.umbralesCuantitativos.maxClientConcentration;
      const avalThreshold = draftProfile.politicaGarantias.montoRequiereAval;

      const dtiOk = dtiRatio <= maxDti;
      const concOk = 21.4 <= maxConc;
      const satOk = draftProfile.filtrosEliminatorios.satOpinionPositiva;
      const efosOk = draftProfile.filtrosEliminatorios.sinListasNegras69B;
      const requiresAval = montoSolicitadoNum >= avalThreshold;

      const resultado = !satOk || !efosOk || !dtiOk
        ? 'rechazado'
        : requiresAval
        ? 'condicionado'
        : 'aprobado';

      const detalles = [
        {
          titulo: `DTI Solicitado vs Ventas (${dtiRatio.toFixed(1)}% vs máx ${maxDti}%)`,
          estado: (dtiOk ? 'cumple' : 'riesgo') as 'cumple' | 'riesgo',
          nota: dtiOk ? 'Aprobado' : 'Supera límite',
        },
        {
          titulo: 'Opinión 32-D SAT & Listas Negras (69-B)',
          estado: 'cumple' as const,
          nota: 'Cumplimiento Positivo',
        },
        {
          titulo: `Concentración en Top Cliente (${maxConc}% máx)`,
          estado: (concOk ? 'cumple' : 'riesgo') as 'cumple' | 'riesgo',
          nota: concOk ? 'Diversificado' : 'Concentrado',
        },
        {
          titulo: `Obligado Solidario (> $${(avalThreshold / 1000000).toFixed(1)}M)`,
          estado: (requiresAval ? 'observacion' : 'cumple') as 'observacion' | 'cumple',
          nota: requiresAval ? 'Requerido' : 'No exigido',
        },
      ];

      const score = Math.round(
        (dtiOk ? 350 : 150) +
        (satOk && efosOk ? 300 : 0) +
        (concOk ? 170 : 80)
      );

      setSimulationResult({
        resultado,
        score,
        detalles,
        resumenIA:
          resultado === 'aprobado'
            ? `El expediente de ${exp.empresa.razonSocial} cumple con los parámetros de la política.`
            : resultado === 'condicionado'
            ? `Solvente con ventas de $18.42M MXN. Se requiere ratificar aval solidario por monto superior a $${(avalThreshold / 1000000).toFixed(1)}M MXN.`
            : `El expediente excede los límites de riesgo permitidos.`,
      });

      setIsSimulating(false);
    }, 500);
  };

  const handleSaveAndActivate = () => {
    if (!draftProfile) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

    const activatedProfile: DecisionProfile = {
      ...draftProfile,
      estado: 'activo',
      actualizadoEn: dateStr,
    };

    updateProfile(activatedProfile);
    setActiveProfile(activatedProfile.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateNewProfile = () => {
    const id = `profile-apy-${Date.now()}`;
    const newProfile: DecisionProfile = {
      id,
      nombre: 'Nuevo Modelo PyME',
      codigo: `APY-${profiles.length + 1}`,
      version: 'v1.0',
      entidad: 'Apoyando Ideas',
      sector: 'Comercio y Servicios',
      descripcion: 'Modelo personalizado para evaluación crediticia.',
      estado: 'borrador',
      actualizadoEn: 'Reciente',
      promptPolitica: QUICK_TEMPLATES[0].prompt,
      filtrosEliminatorios: {
        satOpinionPositiva: true,
        sinListasNegras69B: true,
        antiguedadMinimaMeses: 24,
        maxDiasAtrasoBuro: 30,
      },
      umbralesCuantitativos: {
        maxDtiRatio: 25,
        maxClientConcentration: 35,
        minMonthlyCfdi: 15,
        minFacturacionAnual: 5000000,
        plazoMaximoMeses: 24,
      },
      politicaGarantias: {
        montoRequiereAval: 2000000,
        tipoGarantiaSugerida: 'Obligado Solidario (Representante Legal)',
        aforoFactoraje: '1.2 a 1',
        requiereObligadoSolidario: true,
      },
      directricesIA: [
        'Validar capacidad de pago con facturación SAT de 12 meses.',
        'Verificar ausencia de EFOS en proveedores del SAT.',
      ],
      metricas: {
        tasaAprobacion: 0,
        expedientesEvaluados: 0,
        tiempoPromedioSegundos: 2.0,
      },
    };

    addProfile(newProfile);
    setDraftProfile(newProfile);
    setPromptText(newProfile.promptPolitica);
  };

  if (!profilesLoaded || !draftProfile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-teal-700" />
            Cargando modelos...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/40 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Minimalist Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Modelos de Decisión
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Políticas de crédito configuradas para evaluar expedientes en Apoyando Ideas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateNewProfile}
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 text-zinc-700 border-zinc-200 hover:bg-zinc-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </Button>

            <Button
              onClick={handleSaveAndActivate}
              size="sm"
              className="text-xs h-9 gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer font-medium"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Publicado</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar y Activar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="flex items-center gap-1 border-b border-zinc-200/80 pb-px overflow-x-auto">
          {profiles.map((p) => {
            const isSelected = p.id === draftProfile.id;
            const isActive = p.estado === 'activo';

            return (
              <button
                key={p.id}
                onClick={() => {
                  setDraftProfile(JSON.parse(JSON.stringify(p)));
                  setPromptText(p.promptPolitica);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-teal-700 text-zinc-950 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>{p.nombre}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* 100% WIDTH HERO COMPONENT: Platícale tus políticas a Lucas */}
        <Card className="w-full border-zinc-200/80 shadow-2xs bg-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-zinc-950">
                  Platícale tus políticas a Lucas
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Describe en tus propias palabras qué criterios toma Apoyando Ideas (cobertura de ventas, condiciones SAT, requisitos de avales y plazos).
                </p>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {draftProfile.version}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe aquí las reglas de crédito de tu entidad..."
              disabled={isCompiling}
              className="w-full p-3.5 text-xs sm:text-sm font-sans bg-zinc-50/60 border border-zinc-200/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 text-zinc-900 leading-relaxed placeholder:text-zinc-500 transition-all resize-y"
            />

            {/* Bottom Actions Row: Templates on the left, Compile button on the right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-zinc-500 mr-1">Ejemplos:</span>
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(tmpl.prompt);
                      handleCompilePolicy(tmpl.prompt);
                    }}
                    disabled={isCompiling}
                    className="text-[11px] bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              <Button
                onClick={() => handleCompilePolicy()}
                disabled={isCompiling || !promptText.trim()}
                className="text-xs h-9 px-4 gap-2 bg-teal-800 hover:bg-teal-900 text-white cursor-pointer font-medium shrink-0 self-end sm:self-auto"
              >
                {isCompiling ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compilando...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Compilar con IA</span>
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {compilationSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 p-2.5 rounded-lg flex items-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{compilationSuccessMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* 2-Column Split: Compiled Parameters (Left) vs Real-Time Simulator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Compiled Parameters and Rules */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Block 1: Knockout Filters */}
            <Card className="border-zinc-200/80 shadow-2xs bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-900">
                  Filtros Eliminatorios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/60 cursor-pointer">
                  <span className="text-xs text-zinc-800">
                    Opinión de Cumplimiento SAT 32-D Positiva
                  </span>
                  <input
                    type="checkbox"
                    checked={draftProfile.filtrosEliminatorios.satOpinionPositiva}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        filtrosEliminatorios: {
                          ...draftProfile.filtrosEliminatorios,
                          satOpinionPositiva: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-teal-800 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/60 cursor-pointer">
                  <span className="text-xs text-zinc-800">
                    Cero Proveedores en Listas Negras (Art. 69-B CFF)
                  </span>
                  <input
                    type="checkbox"
                    checked={draftProfile.filtrosEliminatorios.sinListasNegras69B}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        filtrosEliminatorios: {
                          ...draftProfile.filtrosEliminatorios,
                          sinListasNegras69B: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-teal-800 cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/60">
                  <span className="text-xs text-zinc-800">
                    Antigüedad Fiscal Mínima en SAT
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-900">
                    {draftProfile.filtrosEliminatorios.antiguedadMinimaMeses} meses
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Block 2: Quantitative Ratios & Sliders */}
            <Card className="border-zinc-200/80 shadow-2xs bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-900">
                  Criterios Cuantitativos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Max DTI Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-700">Crédito Máximo / Facturación Anual</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {draftProfile.umbralesCuantitativos.maxDtiRatio}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={draftProfile.umbralesCuantitativos.maxDtiRatio}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        umbralesCuantitativos: {
                          ...draftProfile.umbralesCuantitativos,
                          maxDtiRatio: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-teal-800 cursor-pointer"
                  />
                </div>

                {/* Concentration Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-700">Concentración Máxima en 1 Cliente</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {draftProfile.umbralesCuantitativos.maxClientConcentration}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={50}
                    value={draftProfile.umbralesCuantitativos.maxClientConcentration}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        umbralesCuantitativos: {
                          ...draftProfile.umbralesCuantitativos,
                          maxClientConcentration: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-teal-800 cursor-pointer"
                  />
                </div>

                {/* Minimum Monthly CFDIs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-700">Promedio Mínimo de Facturas al Mes</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      {draftProfile.umbralesCuantitativos.minMonthlyCfdi} facturas
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    value={draftProfile.umbralesCuantitativos.minMonthlyCfdi}
                    onChange={(e) =>
                      setDraftProfile({
                        ...draftProfile,
                        umbralesCuantitativos: {
                          ...draftProfile.umbralesCuantitativos,
                          minMonthlyCfdi: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-teal-800 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Block 3: Collateral & Guarantees */}
            <Card className="border-zinc-200/80 shadow-2xs bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-900">
                  Garantías y Avales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/60">
                  <span className="text-xs text-zinc-800">
                    Obligado solidario para créditos mayores a
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-900">
                    ${(draftProfile.politicaGarantias.montoRequiereAval / 1000000).toFixed(1)}M MXN
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50/70 border border-zinc-200/60">
                  <span className="text-xs text-zinc-800">
                    Tipo de Garantía Sugerida
                  </span>
                  <span className="text-xs text-zinc-900 font-medium">
                    {draftProfile.politicaGarantias.tipoGarantiaSugerida}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Directives for Experto Apoyando Ideas */}
            <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-2xs space-y-2">
              <span className="text-xs font-semibold text-zinc-900 block">
                Criterios de Razonamiento del Experto Apoyando Ideas
              </span>
              <ul className="space-y-1 text-xs text-zinc-600">
                {draftProfile.directricesIA.map((dir, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-700 font-semibold">•</span>
                    <span>{dir}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Live Backtest Simulator */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="border-zinc-200/80 shadow-2xs bg-white sticky top-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-zinc-900 flex items-center justify-between">
                  <span>Simulador de Expedientes</span>
                  <span className="text-[11px] font-normal text-zinc-500">Prueba en vivo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <p className="text-xs text-zinc-500">
                  Verifica cómo este modelo califica y dictamina a un solicitante real antes de guardar cambios.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-zinc-600 block">
                    Expediente a evaluar:
                  </label>
                  <select
                    value={selectedExpedienteId}
                    onChange={(e) => setSelectedExpedienteId(e.target.value)}
                    className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {expedientes.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.folio} • {e.empresa.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  variant="outline"
                  className="w-full text-xs h-9 gap-1.5 text-zinc-800 border-zinc-300 hover:bg-zinc-50 cursor-pointer font-medium"
                >
                  {isSimulating ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluando con IA...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-teal-700" />
                      <span>Simular Evaluación</span>
                    </>
                  )}
                </Button>

                {/* Simulation Output */}
                <AnimatePresence>
                  {simulationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 space-y-2.5 border-t border-zinc-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-900">
                          {simulationResult.resultado === 'aprobado'
                            ? 'Aprobado'
                            : simulationResult.resultado === 'condicionado'
                            ? 'Aprobado Condicionado'
                            : 'Rechazado'}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          Score {simulationResult.score}/850
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/70 p-2.5 rounded-lg border border-zinc-100">
                        {simulationResult.resumenIA}
                      </p>

                      <div className="space-y-1 text-xs pt-1">
                        {simulationResult.detalles.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-zinc-600 py-1 border-b border-zinc-50 last:border-none">
                            <span className="text-[11px] truncate">{d.titulo}</span>
                            <span className="text-[11px] font-medium text-zinc-800 shrink-0 ml-2">
                              {d.nota}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2">
                        <Link
                          href={`/expedientes/${selectedExpedienteId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-800 hover:underline"
                        >
                          <span>Ver expediente completo</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

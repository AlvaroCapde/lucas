'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Building2,
  Lock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpedientes } from '@/lib/expedientes-store';

export default function OnboardingIndexPage() {
  const router = useRouter();
  const { expedientes } = useExpedientes();

  return (
    <div className="min-h-screen bg-grid relative flex flex-col items-center justify-start p-4 sm:p-8 text-zinc-950 font-sans selection:bg-teal-500/20 selection:text-teal-950 overflow-x-hidden">
      {/* Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-teal-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-xl space-y-6 mt-4 sm:mt-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            Evaluación de Crédito
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
            Portal para la carga y validación de documentación oficial para la evaluación de financiamiento.
          </p>
        </div>

        {/* Primary Demo Card with Glassmorphic Style */}
        <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-zinc-200/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900">
                Flujo Demostrativo
              </span>
            </div>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 border border-teal-200/70 px-2 py-0.5 rounded-md">
              4 Pasos • Cifrado TLS
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Experimenta el portal de onboarding con el expediente de prueba (INE, CFE, Estados de cuenta y Financieros).
          </p>

          <div className="pt-1">
            <Button
              onClick={() => router.push('/onboarding/demo')}
              className="w-full text-xs font-semibold py-3 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Abrir Portal de Onboarding</span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
            </Button>
          </div>
        </div>

        {/* List of Expedientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Expedientes activos ({expedientes.length})
            </h2>
            <Link
              href="/"
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Ir al Panel Principal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80 bg-white/85 backdrop-blur-xl overflow-hidden shadow-sm">
            {expedientes.map((exp) => (
              <div
                key={exp.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-teal-50/20 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-900 bg-teal-50/80 border border-teal-200/60 px-2 py-0.5 rounded">
                      {exp.folio}
                    </span>
                    <span className="text-xs font-bold text-zinc-950 truncate">
                      {exp.empresa.razonSocial}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-sans">
                    <span>Contacto: {exp.contacto.nombre}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-600">RFC: {exp.empresa.rfc}</span>
                  </div>
                </div>

                <Link
                  href={`/onboarding/${exp.tokenAcceso}`}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-200/90 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <span>Abrir</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

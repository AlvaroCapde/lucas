import React from 'react';
import { Expediente } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { FolderGit2, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

interface MetricsBarProps {
  expedientes: Expediente[];
}

export function MetricsBar({ expedientes }: MetricsBarProps) {
  const total = expedientes.length;
  const pmCount = expedientes.filter(
    (e) => (e.empresa.tipoPersona || (e.empresa.rfc.length === 12 ? 'persona_moral' : 'persona_fisica')) === 'persona_moral'
  ).length;
  const pfCount = expedientes.filter(
    (e) => (e.empresa.tipoPersona || (e.empresa.rfc.length === 12 ? 'persona_moral' : 'persona_fisica')) === 'persona_fisica'
  ).length;

  const enCaptura = expedientes.filter(
    (e) =>
      e.estado === 'extrayendo' ||
      e.estado === 'enlace_enviado' ||
      e.estado === 'esperando_credenciales' ||
      e.estado === 'pendiente_envio'
  ).length;

  const aprobadosIA = expedientes.filter(
    (e) =>
      e.estado === 'aprobado_ia' ||
      (e.resumen?.scoreSolvencia &&
        e.resumen.scoreSolvencia >= 700 &&
        e.estado !== 'credito_rechazado' &&
        e.estado !== 'rechazado_ia')
  ).length;

  const aprobados = expedientes.filter(
    (e) => e.estado === 'credito_aprobado' || e.estado === 'completado'
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Total Expedientes */}
      <Card className="p-4 bg-white/80 border-zinc-200/70 hover:border-zinc-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 tracking-tight">Expedientes Totales</span>
          <span className="p-1.5 rounded-md bg-zinc-100/80 text-zinc-600">
            <FolderGit2 className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-semibold font-mono tracking-tight text-zinc-950">
              {total}
            </span>
            <span className="text-xs text-zinc-400 font-mono">expedientes</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
            {pmCount} PM / {pfCount} PF
          </span>
        </div>
      </Card>

      {/* En Proceso de Extracción / Captura */}
      <Card className="p-4 bg-white/80 border-zinc-200/70 hover:border-amber-300/60 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 tracking-tight">En Captura / Scraping</span>
          <span className="p-1.5 rounded-md bg-amber-50 text-amber-600">
            <Activity className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-semibold font-mono tracking-tight text-amber-600">
            {enCaptura}
          </span>
          <span className="text-xs text-amber-700/80 font-mono">en proceso</span>
        </div>
      </Card>

      {/* Aprobados por Modelo IA */}
      <Card className="p-4 bg-white/80 border-zinc-200/70 hover:border-teal-300/60 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 tracking-tight">Aprobados por Modelo IA</span>
          <span className="p-1.5 rounded-md bg-teal-50 text-teal-700">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-semibold font-mono tracking-tight text-teal-800">
            {aprobadosIA}
          </span>
          <span className="text-xs text-teal-700/80 font-mono">score favorable</span>
        </div>
      </Card>

      {/* Créditos Aprobados */}
      <Card className="p-4 bg-white/80 border-zinc-200/70 hover:border-emerald-300/60 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500 tracking-tight">Créditos Aprobados</span>
          <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-semibold font-mono tracking-tight text-emerald-600">
            {aprobados}
          </span>
          <span className="text-xs text-emerald-700/80 font-mono">líneas autorizadas</span>
        </div>
      </Card>
    </div>
  );
}


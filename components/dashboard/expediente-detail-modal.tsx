'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Database,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { getProductBadgeInfo } from './expedientes-table';
import { JsonViewer } from '@/components/ui/json-viewer';
import { Expediente } from '@/lib/types';

interface ExpedienteDetailModalProps {
  expediente: Expediente | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenClientPortal: (expediente: Expediente) => void;
  onAdvanceStatus: (expedienteId: string) => void;
}

const tactileEase = [0.16, 1, 0.3, 1] as const;

export function ExpedienteDetailModal({
  expediente,
  isOpen,
  onClose,
  onOpenClientPortal,
  onAdvanceStatus,
}: ExpedienteDetailModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumen' | 'timeline' | 'json'>('resumen');

  if (!isOpen || !expediente) return null;

  const magicLink = `https://lucas.io/extrac/inv-${expediente.tokenAcceso}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(magicLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isCompleted = ['esperando_aprobacion', 'credito_aprobado', 'credito_rechazado', 'completado'].includes(
    expediente.estado
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.3, ease: tactileEase }}
          className="relative w-full max-w-4xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-zinc-950 bg-zinc-200/80 px-2 py-0.5 rounded">
                  {expediente.folio}
                </span>
                <StatusBadge status={expediente.estado} />
                <span className="text-xs font-mono text-zinc-400">
                  Creado: {expediente.creadoEn}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                {expediente.empresa.razonSocial}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="px-6 py-2.5 bg-zinc-100/50 border-b border-zinc-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 max-w-md truncate">
              <span className="text-zinc-500 font-medium">Enlace del Contacto:</span>
              <code className="font-mono bg-white px-2 py-1 rounded border border-zinc-200 text-zinc-700 text-[11px] truncate">
                {magicLink}
              </code>
              <button
                onClick={handleCopyLink}
                className="p-1 text-zinc-500 hover:text-teal-700 bg-white border border-zinc-200 rounded transition-colors"
                title="Copiar enlace de extracción"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenClientPortal(expediente)}
                className="h-8 text-xs gap-1.5 border-teal-200 text-teal-800 bg-teal-50/60 hover:bg-teal-100"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                Simular Vista del Cliente
              </Button>

              {!isCompleted && (
                <Button
                  size="sm"
                  onClick={() => onAdvanceStatus(expediente.id)}
                  className="h-8 text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Simular Avance de Extracción
                </Button>
              )}
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-zinc-100 px-6 bg-white gap-6">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`py-3 text-xs font-semibold tracking-tight border-b-2 transition-all ${
                activeTab === 'resumen'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Resumen & Solvencia
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 text-xs font-semibold tracking-tight border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span>Flujo de Extracción</span>
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`py-3 text-xs font-semibold tracking-tight border-b-2 transition-all ${
                activeTab === 'json'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Data Cruda (JSON SAT)
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'resumen' && (
              <div className="space-y-6">
                {/* 2 Cards: Contacto & Empresa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tarjeta de Contacto */}
                  <Card className="p-4 bg-zinc-50/50 border-zinc-200/80">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold uppercase text-zinc-800 tracking-tight">
                          Información del Contacto
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200/60">
                        Vía {expediente.contacto.metodoNotificacion}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-zinc-500 block">Nombre Completo:</span>
                        <span className="font-semibold text-zinc-950 text-sm">{expediente.contacto.nombre}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Cargo / Rol:</span>
                        <span className="text-zinc-800">{expediente.contacto.puesto || 'No especificado'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Email:</span>
                          <span className="font-mono text-zinc-800 text-[11px] truncate block">
                            {expediente.contacto.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[11px]">Teléfono:</span>
                          <span className="font-mono text-zinc-800 text-[11px]">
                            {expediente.contacto.telefono}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Tarjeta de Empresa & Fuentes */}
                  <Card className="p-4 bg-zinc-50/50 border-zinc-200/80">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold uppercase text-zinc-800 tracking-tight">
                          Datos de la Entidad
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs bg-zinc-200 text-zinc-900 px-2 py-0.5 rounded">
                        {expediente.empresa.rfc}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Producto:</span>
                        {(() => {
                          const prodBadge = getProductBadgeInfo(expediente.empresa.tipoProducto);
                          const ProdIcon = prodBadge.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prodBadge.className}`}>
                              <ProdIcon className="w-3 h-3" />
                              {prodBadge.label}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Sector / Industria:</span>
                        <span className="text-zinc-800 font-medium">{expediente.empresa.sector}</span>
                      </div>
                      {expediente.empresa.destinoDetalle && (
                        <div>
                          <span className="text-zinc-500 block">Bien / Destino:</span>
                          <span className="text-teal-900 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 block truncate">
                            {expediente.empresa.destinoDetalle}
                          </span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-zinc-500 block">Monto Solicitado:</span>
                          <span className="font-mono font-semibold text-zinc-900">
                            {expediente.empresa.montoSolicitado || 'No especificado'}
                          </span>
                        </div>
                        {expediente.empresa.plazoMeses && (
                          <div className="text-right">
                            <span className="text-zinc-500 block">Plazo:</span>
                            <span className="font-mono text-zinc-800">
                              {expediente.empresa.plazoMeses} meses
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Fuentes Solicitadas:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {expediente.fuentes.map((f) => (
                            <span
                              key={f}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 text-zinc-800"
                            >
                              {f.replace('_', ' ').toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Resumen de Solvencia Extraída (Happy Path) */}
                {isCompleted && expediente.resumen ? (
                  <div className="rounded-xl border border-emerald-300/80 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-sm font-bold text-zinc-950 tracking-tight">
                          Análisis de Solvencia & Scraping SAT
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        200 OK • EXTRACCIÓN VERIFICADA
                      </span>
                    </div>

                    {/* KPIs de solvencia */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                        <span className="text-[11px] text-zinc-500 font-medium block">Score de Solvencia</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold font-mono text-emerald-700">
                            {expediente.resumen.scoreSolvencia}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">/ 850</span>
                        </div>
                        <span className="text-[10px] font-medium text-emerald-800">
                          {expediente.resumen.categoriaRiesgo}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                        <span className="text-[11px] text-zinc-500 font-medium block">Facturación 12m</span>
                        <div className="text-lg font-bold font-mono text-zinc-900 mt-1 truncate">
                          {expediente.resumen.totalFacturado}
                        </div>
                        <span className="text-[10px] text-zinc-500">Monto total comprobado</span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                        <span className="text-[11px] text-zinc-500 font-medium block">Comprobantes SAT</span>
                        <div className="text-lg font-bold font-mono text-zinc-900 mt-1">
                          {((expediente.resumen.cfdiEmitidos || 0) + (expediente.resumen.cfdiRecibidos || 0)).toLocaleString()} CFDI
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {expediente.resumen.cfdiEmitidos} emit. / {expediente.resumen.cfdiRecibidos} recib.
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                        <span className="text-[11px] text-zinc-500 font-medium block">Opinión SAT 32-D</span>
                        <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
                          {expediente.resumen.opinionCumplimiento}
                        </div>
                        <span className="text-[10px] text-emerald-700">Sin adeudos fiscales</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 text-center space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">Extracción de datos pendiente</h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                        El contacto aún no ha finalizado el ingreso de sus credenciales CIEC. Puedes abrir el simulador para probar el portal como si fueras el contacto o forzar el avance.
                      </p>
                    </div>
                    <div className="pt-2 flex justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => onOpenClientPortal(expediente)}
                        className="text-xs gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir y Completar como Cliente
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notas internas */}
                {expediente.notasInternas && (
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 text-xs">
                    <span className="font-semibold text-zinc-700 block mb-0.5">Notas del expediente:</span>
                    <p className="text-zinc-600 leading-relaxed">{expediente.notasInternas}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                  {expediente.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                          event.estado === 'done'
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : event.estado === 'active'
                            ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                            : 'bg-white border-zinc-300 text-zinc-300'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      <div className="flex-1 bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-zinc-950 tracking-tight">
                            {event.titulo}
                          </h5>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {event.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                          {event.descripcion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab JSON */}
            {activeTab === 'json' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-mono">
                  <span>EXPEDIENTE_STRUCTURED_PAYLOAD.JSON</span>
                  <span className="text-teal-600">ENCODING // UTF-8</span>
                </div>
                <JsonViewer data={expediente} className="max-h-[460px]" />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

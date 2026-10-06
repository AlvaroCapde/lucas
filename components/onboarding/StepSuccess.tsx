'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expediente } from '@/lib/types';
import { OnboardingState } from './types';

interface StepSuccessProps {
  expediente: Expediente;
  state: OnboardingState;
  onReturnToDashboard?: () => void;
}

export function StepSuccess({ expediente, state, onReturnToDashboard }: StepSuccessProps) {
  const isPersonaFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  const completedDocs = [
    {
      name: isPersonaFisica ? 'Identificación oficial (Titular)' : 'Identificación oficial (Representante)',
      detail: 'INE validado por OCR',
    },
    {
      name: isPersonaFisica ? 'Domicilio particular' : 'Domicilio fiscal corporativo',
      detail: state.addressDoc?.name || 'Comprobante vigente validado',
    },
    {
      name: 'Sincronización SAT (CIEC)',
      detail: state.siecKey ? (isPersonaFisica ? '32-D PF Positiva y CFDIs sincronizados' : '32-D PM Positiva y CFDIs sincronizados') : 'Validación SAT completada',
    },
    {
      name: isPersonaFisica ? 'Estados de cuenta personales' : 'Estados de cuenta bancarios',
      detail: '3 meses consecutivos recibidos',
    },
    {
      name: isPersonaFisica ? 'Comprobante de ingresos / Declaración' : 'Estados financieros internos',
      detail: state.internalFinancialsDoc?.name || (isPersonaFisica ? 'Declaración Anual SAT' : 'Balance y Resultados'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-800 to-teal-600 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md"
        >
          <Check className="w-7 h-7 stroke-[2.5]" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
          Documentación enviada con éxito
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Gracias, {expediente.contacto.nombre.split(' ')[0]}. Hemos recibido y procesado los 5 requisitos. El comité de auditoría y análisis de <strong className="text-teal-950 font-semibold">Apoyando Ideas</strong> evaluará la solicitud de {isPersonaFisica ? <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial} (Persona Física)</strong> : <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong>}.
        </p>
      </div>

      <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/40 via-white to-zinc-50/50 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-200">
          <div>
            <span className="text-zinc-500 block">Folio de trámite</span>
            <span className="font-mono font-bold text-teal-900 block mt-0.5">{expediente.folio}</span>
          </div>
          <div className="text-right">
            <span className="text-zinc-500 block">Fecha de recepción</span>
            <span className="text-zinc-900 block mt-0.5 font-mono">
              {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-700 block">
            Resumen de evaluación (5 de 5)
          </span>
          <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white overflow-hidden text-xs">
            {completedDocs.map((doc, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-900">{doc.name}</span>
                <span className="text-teal-800 font-mono text-[11px] truncate max-w-[200px]">{doc.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <Button
          onClick={() => {
            alert(`Acuse digital de recepción para el folio ${expediente.folio} generado y descargado.`);
          }}
          variant="outline"
          className="w-full text-xs font-medium py-3 flex items-center justify-center gap-2 border-zinc-300 hover:bg-zinc-50 rounded-xl cursor-pointer"
        >
          <Download className="w-4 h-4 text-zinc-600" />
          <span>Descargar acuse de recepción (PDF)</span>
        </Button>

        {onReturnToDashboard && (
          <Button
            onClick={onReturnToDashboard}
            className="w-full text-xs font-semibold py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] shadow-xs"
          >
            <span>Ir al panel principal</span>
            <ArrowRight className="w-4 h-4 text-teal-200" />
          </Button>
        )}
      </div>
    </div>
  );
}

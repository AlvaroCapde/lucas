'use client';

import React from 'react';
import { ArrowRight, Building2, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expediente } from '@/lib/types';

interface StepWelcomeProps {
  expediente: Expediente;
  onStart: () => void;
}

export function StepWelcome({ expediente, onStart }: StepWelcomeProps) {
  const isFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  const steps = [
    {
      num: '1',
      title: isFisica ? 'Identificación oficial del titular' : 'Identificación oficial del representante',
      desc: isFisica
        ? 'Fotografía legible de anverso y reverso de tu INE o pasaporte vigente.'
        : 'Fotografía legible de anverso y reverso del INE o pasaporte del representante legal.',
    },
    {
      num: '2',
      title: isFisica ? 'Comprobante de domicilio' : 'Comprobante de domicilio fiscal',
      desc: 'Recibo reciente de CFE, Telmex o servicio no mayor a 90 días.',
    },
    {
      num: '3',
      title: 'Autenticación SAT (Contraseña CIEC)',
      desc: isFisica
        ? 'Clave de acceso al portal SAT para validar CFDIs de honorarios, nómina o actividad y Opinión 32-D.'
        : 'Clave de acceso al portal SAT para sincronizar comprobantes fiscales y Opinión 32-D corporativa.',
    },
    {
      num: '4',
      title: 'Estados de cuenta bancarios',
      desc: isFisica
        ? 'Archivos PDF de los últimos 3 meses de tu cuenta personal, nómina o actividad económica.'
        : 'Archivos PDF de los últimos 3 meses de la cuenta operativa principal de la empresa.',
    },
    {
      num: '5',
      title: isFisica ? 'Comprobante de ingresos / Declaración Anual' : 'Estados financieros internos',
      desc: isFisica
        ? 'Declaración Anual del SAT, acuse de pagos provisionales o comprobantes de ingresos con firma de Buró.'
        : 'Balance General y Estado de Resultados con cédula de contador y autorización de Buró de Crédito.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-medium">
          {isFisica ? (
            <>
              <User className="w-3.5 h-3.5 text-teal-700" />
              <span>Solicitante Persona Individual</span>
            </>
          ) : (
            <>
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Solicitante Empresa (Persona Moral)</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
          {isFisica ? 'Evaluación de Crédito Individual' : 'Evaluación de Crédito Empresarial'}
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Hola {expediente.contacto.nombre.split(' ')[0]}, completa los 5 pasos requeridos para la evaluación crediticia de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong> con <strong className="text-teal-950 font-semibold">Apoyando Ideas</strong>.
        </p>
      </div>

      {/* Summary Box */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-zinc-500 block">
            {isFisica ? 'Persona solicitante' : 'Empresa solicitante'}
          </span>
          <span className="font-semibold text-zinc-900 block mt-0.5">{expediente.empresa.razonSocial}</span>
          <div className="flex items-center gap-2 text-zinc-600 font-mono mt-0.5">
            <span>RFC: {expediente.empresa.rfc}</span>
            {expediente.empresa.curp && (
              <>
                <span>•</span>
                <span>CURP: {expediente.empresa.curp}</span>
              </>
            )}
          </div>
        </div>
        <div>
          <span className="text-zinc-500 block">Folio de solicitud</span>
          <span className="font-mono font-bold text-teal-900 block mt-0.5">{expediente.folio}</span>
          {expediente.empresa.montoSolicitado && (
            <span className="text-zinc-600">Línea solicitada: <strong className="text-zinc-900 font-semibold">{expediente.empresa.montoSolicitado}</strong></span>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Pasos requeridos (5 requisitos)
        </h2>
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
          {steps.map((s) => (
            <div key={s.num} className="p-4 flex items-start gap-4 hover:bg-zinc-50/60 transition-colors">
              <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {s.num}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">{s.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Button
          onClick={onStart}
          size="lg"
          className="w-full text-sm font-semibold py-3.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <span>Comenzar evaluación</span>
          <ArrowRight className="w-4 h-4 text-teal-200" />
        </Button>
      </div>
    </div>
  );
}

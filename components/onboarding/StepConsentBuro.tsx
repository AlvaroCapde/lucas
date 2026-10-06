'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Scale,
  Lock,
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { Expediente } from '@/lib/types';

interface StepConsentBuroProps {
  expediente: Expediente;
  buroConsent: boolean;
  buroSignature: string | null;
  signatureType: 'draw' | 'type';
  typedSignatureName: string;
  onConsentChange: (consent: boolean) => void;
  onSignatureChange: (signature: string | null, type: 'draw' | 'type') => void;
}

export function StepConsentBuro({
  expediente,
  buroConsent,
  buroSignature,
  signatureType,
  typedSignatureName,
  onConsentChange,
  onSignatureChange,
}: StepConsentBuroProps) {
  const [showFullTerms, setShowFullTerms] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-teal-800 mb-1">
          Paso 1 de 6 • Autorización Crediticia
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
          Autorización para Buró y Círculo de Crédito
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
          Para evaluar la viabilidad de la solicitud sin solicitar avales colaterales excesivos, requerimos tu consentimiento formal para consultar el historial crediticio de la empresa y su representante.
        </p>
      </div>

      {/* Resumen Legal */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Titular de la Autorización</span>
            <p className="text-xs font-semibold text-zinc-900">{expediente.contacto.nombre}</p>
            <p className="text-xs text-zinc-500">
              RFC: <span className="font-mono">{expediente.empresa.rfc}</span> • {expediente.empresa.razonSocial}
            </p>
          </div>
          <span className="text-xs text-zinc-500 shrink-0">
            {todayFormatted}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200/70 text-xs text-teal-950 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-teal-900">
            <Scale className="w-3.5 h-3.5 text-teal-700" />
            <span>Autorización ante Sociedades de Información Crediticia</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-normal">
            Facultas a <strong>Apoyando Ideas</strong> para realizar consultas periódicas sobre el comportamiento de crédito y cumplimiento financiero durante la vigencia de la relación contractual o evaluación de la solicitud.
          </p>
        </div>

        {/* Acordeón de Términos Legales */}
        <div className="border-t border-zinc-100 pt-2.5">
          <button
            type="button"
            onClick={() => setShowFullTerms(!showFullTerms)}
            className="flex items-center justify-between w-full text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors"
          >
            <span>Ver cláusula legal de consulta (Ley para Regular las SICs)</span>
            {showFullTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullTerms && (
            <div className="mt-2.5 p-3 rounded-lg bg-zinc-50 text-[11px] text-zinc-600 space-y-2 max-h-48 overflow-y-auto leading-relaxed border border-zinc-200">
              <p>
                Por medio del presente instrumento, quien suscribe autoriza expresa e irrevocablemente a Apoyando Ideas y a sus entidades financieras aliadas para que conjunta o indistintamente lleven a cabo las investigaciones sobre el comportamiento crediticio de la persona moral o física con actividad empresarial aquí representada.
              </p>
              <p>
                Dicha consulta podrá realizarse ante cualquier Sociedad de Información Crediticia debidamente autorizada por la Secretaría de Hacienda y Crédito Público (Buró de Crédito y/o Círculo de Crédito), de conformidad con el artículo 28 de la Ley para Regular las Sociedades de Información Crediticia.
              </p>
              <p>
                Esta autorización conservará constancia digital inalterable conforme a la Norma Oficial Mexicana NOM-151-SCFI-2016.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checkbox Vinculante */}
      <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={buroConsent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-zinc-950 block">
              Otorgo mi consentimiento expreso e informado
            </span>
            <span className="text-[11px] text-zinc-600 leading-normal block">
              Confirmo que actúo como titular o representante legal facultado y autorizo expresamente la consulta de antecedentes crediticios ante las Sociedades de Información Crediticia.
            </span>
          </div>
        </label>
      </div>

      {/* Firma Digital */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
            Firma del Representante Legal
            <span className="text-teal-700 text-[11px] font-normal">*Obligatoria</span>
          </label>
          <span className="text-xs text-zinc-500">
            {buroSignature ? 'Firma registrada' : 'Pendiente'}
          </span>
        </div>

        <SignaturePad
          onSignatureChange={onSignatureChange}
          defaultName={expediente.contacto.nombre}
        />
      </div>

      {!buroConsent && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Es necesario marcar la casilla de consentimiento para avanzar al siguiente paso.</span>
        </div>
      )}
    </div>
  );
}

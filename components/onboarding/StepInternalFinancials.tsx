'use client';

import React from 'react';
import { DocumentUploadSlot } from './DocumentUploadSlot';
import { UploadedDoc } from './types';
import { Expediente } from '@/lib/types';
import { FileSpreadsheet, FileText, UserCheck, Building2, User } from 'lucide-react';

interface StepInternalFinancialsProps {
  expediente: Expediente;
  internalDoc: UploadedDoc | null;
  hasCertifiedAccountant: boolean;
  accountantCedula?: string;
  fiscalYear: string;
  buroConsent: boolean;
  onDocChange: (doc: UploadedDoc | null) => void;
  onHasCertifiedChange: (val: boolean) => void;
  onCedulaChange: (val: string) => void;
  onFiscalYearChange: (val: string) => void;
  onConsentChange: (val: boolean) => void;
}

export function StepInternalFinancials({
  expediente,
  internalDoc,
  fiscalYear,
  buroConsent,
  onDocChange,
  onFiscalYearChange,
  onConsentChange,
}: StepInternalFinancialsProps) {
  const isPersonaFisica = expediente.empresa.tipoPersona === 'persona_fisica';
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-medium mb-1">
          Paso 5 de 5
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          {isPersonaFisica ? 'Comprobación de ingresos y situación fiscal' : 'Estados financieros internos'}
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {isPersonaFisica ? (
            <>
              Sube tu Declaración Anual del SAT más reciente, recibos de nómina timbrados o constancia de situación fiscal de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong>.
            </>
          ) : (
            <>
              Sube el Balance General y Estado de Resultados más reciente de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong>.
            </>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-700 block">
          {isPersonaFisica ? 'Periodo fiscal o de comprobación' : 'Periodo contable'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onFiscalYearChange(isPersonaFisica ? `Ejercicio Fiscal ${currentYear - 1}` : `Corte Parcial ${currentYear}`)}
            className={`p-3 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
              fiscalYear.includes('Parcial') || fiscalYear.includes('Ejercicio')
                ? 'border-teal-700 bg-teal-900 text-white shadow-xs'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <span className="block font-semibold">
              {isPersonaFisica ? `Declaración Anual ${currentYear - 1}` : `Corte Parcial ${currentYear}`}
            </span>
            <span className={`text-[11px] block mt-0.5 ${fiscalYear.includes('Parcial') || fiscalYear.includes('Ejercicio') ? 'text-teal-200' : 'text-zinc-500'}`}>
              {isPersonaFisica ? 'Acuse y formato SAT' : 'Último trimestre cerrado'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFiscalYearChange(isPersonaFisica ? 'Últimos 3 meses (Recibos / Pagos)' : `Cierre Anual ${currentYear - 1}`)}
            className={`p-3 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
              fiscalYear.includes('Anual') || fiscalYear.includes('meses')
                ? 'border-teal-700 bg-teal-900 text-white shadow-xs'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <span className="block font-semibold">
              {isPersonaFisica ? 'Últimos 3 meses' : `Cierre Anual ${currentYear - 1}`}
            </span>
            <span className={`text-[11px] block mt-0.5 ${fiscalYear.includes('Anual') || fiscalYear.includes('meses') ? 'text-teal-200' : 'text-zinc-500'}`}>
              {isPersonaFisica ? 'Recibos timbrados o pagos prov.' : 'Ejercicio fiscal previo'}
            </span>
          </button>
        </div>
      </div>

      <DocumentUploadSlot
        label={isPersonaFisica ? 'Declaración Anual SAT o Comprobante de Ingresos' : 'Balance General y Estado de Resultados'}
        sublabel={isPersonaFisica ? 'Formato PDF o XML timbrado por el SAT' : 'Formato PDF o Excel (.xlsx)'}
        accept="application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/xml"
        uploadedDoc={internalDoc}
        onDocChange={onDocChange}
        mockFileName={isPersonaFisica ? `Declaracion_Anual_${expediente.empresa.rfc}.pdf` : `Estados_Financieros_${expediente.empresa.rfc}.xlsx`}
        mockFileSize={isPersonaFisica ? '1.8 MB' : '3.2 MB'}
      />

      {/* Buró Consent Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-3 p-4 rounded-xl border border-teal-200/90 bg-teal-50/30 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={buroConsent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
          />
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-zinc-900 block flex items-center gap-1.5">
              {isPersonaFisica ? <User className="w-3.5 h-3.5 text-teal-700" /> : <Building2 className="w-3.5 h-3.5 text-teal-700" />}
              Autorización de consulta en Buró de Crédito (SIC)
            </span>
            <span className="text-xs text-zinc-600 block leading-relaxed">
              {isPersonaFisica ? (
                <>
                  Autorizo expresamente a Lucas en mi carácter de persona física y titular (<strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong>, RFC: {expediente.empresa.rfc}) a consultar mi historial crediticio ante Sociedades de Información Crediticia (Buró de Crédito / Círculo de Crédito) para la emisión del dictamen crediticio.
                </>
              ) : (
                <>
                  Autorizo a Lucas a consultar el historial crediticio de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong> y sus representantes legales ante Sociedades de Información Crediticia para la emisión de la resolución financiera.
                </>
              )}
            </span>
          </div>
        </label>
      </div>
    </div>
  );
}


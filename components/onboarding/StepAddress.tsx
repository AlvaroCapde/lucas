'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, MapPin, Calendar, Building2, ShieldCheck, Home } from 'lucide-react';
import { DocumentUploadSlot } from './DocumentUploadSlot';
import { UploadedDoc } from './types';
import { Expediente } from '@/lib/types';

interface StepAddressProps {
  expediente: Expediente;
  addressDoc: UploadedDoc | null;
  addressType: 'cfe' | 'telmex' | 'otro';
  onDocChange: (doc: UploadedDoc | null) => void;
  onTypeChange: (type: 'cfe' | 'telmex' | 'otro') => void;
}

export function StepAddress({
  expediente,
  addressDoc,
  addressType,
  onDocChange,
  onTypeChange,
}: StepAddressProps) {
  const isFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-medium mb-1">
          Paso 2 de 5
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          {isFisica ? 'Comprobante de domicilio' : 'Comprobante de domicilio fiscal'}
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {isFisica ? (
            <>
              Sube un recibo de servicio reciente (menor a 90 días) correspondiente a tu domicilio particular o fiscal (<strong className="text-zinc-900 font-medium">{expediente.contacto.nombre}</strong>).
            </>
          ) : (
            <>
              Sube un recibo de servicio reciente (menor a 90 días) correspondiente al domicilio operativo o fiscal de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong>.
            </>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-700 block font-mono">
          Tipo de servicio o emisor
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['cfe', 'telmex', 'otro'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center ${
                addressType === type
                  ? 'border-teal-700 bg-teal-900 text-white shadow-xs'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
              }`}
            >
              {type === 'cfe' ? 'CFE (Luz)' : type === 'telmex' ? 'Telmex / Telefonía' : 'Otro servicio'}
            </button>
          ))}
        </div>
      </div>

      <DocumentUploadSlot
        label={`Recibo de ${addressType === 'cfe' ? 'CFE' : addressType === 'telmex' ? 'Telmex' : 'Servicio'}`}
        sublabel="Formato PDF o fotografía legible"
        uploadedDoc={addressDoc}
        onDocChange={onDocChange}
        mockFileName={
          addressType === 'cfe'
            ? 'Recibo_CFE_Agosto2026.pdf'
            : addressType === 'telmex'
            ? 'Recibo_Telmex_Agosto2026.pdf'
            : 'Comprobante_Domicilio.pdf'
        }
        mockFileSize="1.6 MB"
      />

      {/* Extracted Data Analysis Card */}
      <AnimatePresence>
        {addressDoc && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 via-white to-zinc-50/50 p-4 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-semibold text-teal-950">
                  Datos extraídos del comprobante
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                Vigencia Válida (&lt; 90 días)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-teal-100/80 shadow-2xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Emisor identificado</span>
                <span className="font-medium text-zinc-900 block mt-0.5">
                  {addressType === 'cfe'
                    ? 'CFE Suministrador de Servicios Básicos'
                    : addressType === 'telmex'
                    ? 'Teléfonos de México S.A.B.'
                    : 'Servicio Básico Domiciliado'}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Periodo de facturación</span>
                <span className="font-medium text-zinc-900 block mt-0.5">
                  Agosto 2026 <span className="text-emerald-700 font-normal font-mono">(hace 22 días)</span>
                </span>
              </div>

              <div className="sm:col-span-2 pt-1 border-t border-zinc-100">
                <span className="text-zinc-500 block text-[11px]">
                  {isFisica ? 'Dirección de residencia detectada' : 'Dirección operativa detectada'}
                </span>
                <span className="font-medium text-zinc-900 block mt-0.5">
                  {isFisica
                    ? 'Paseo de las Palmas 740, Depto 402, Lomas de Chapultepec, CP 11000, Miguel Hidalgo, CDMX'
                    : 'Av. Tecnológico 1420, Parque Industrial Bajío, CP 38010, Celaya, Guanajuato'}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-teal-800 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>
                    {isFisica
                      ? 'Código postal y titular coinciden con el registro fiscal del solicitante.'
                      : 'Código postal y razón social coinciden con la constancia de situación fiscal del SAT.'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

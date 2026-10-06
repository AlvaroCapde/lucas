'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { DocumentUploadSlot } from './DocumentUploadSlot';
import { UploadedDoc } from './types';
import { Expediente } from '@/lib/types';

interface StepIdentityProps {
  expediente: Expediente;
  ineFront: UploadedDoc | null;
  ineBack: UploadedDoc | null;
  onFrontChange: (doc: UploadedDoc | null) => void;
  onBackChange: (doc: UploadedDoc | null) => void;
}

export function StepIdentity({
  expediente,
  ineFront,
  ineBack,
  onFrontChange,
  onBackChange,
}: StepIdentityProps) {
  const isComplete = Boolean(ineFront && ineBack);
  const isFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-medium mb-1">
          Paso 1 de 5
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          {isFisica ? 'Identificación oficial del titular' : 'Identificación oficial del representante'}
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {isFisica ? (
            <>
              Sube el anverso y reverso de tu credencial de elector (INE) o pasaporte vigente a nombre de <strong className="text-zinc-900 font-medium">{expediente.contacto.nombre}</strong>.
            </>
          ) : (
            <>
              Sube el anverso y reverso de la credencial de elector (INE) o pasaporte vigente del representante legal de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong> (<strong className="text-zinc-900 font-medium">{expediente.contacto.nombre}</strong>).
            </>
          )}
        </p>
      </div>

      <div className="space-y-4">
        <DocumentUploadSlot
          label="Anverso (Frente)"
          sublabel="Foto frontal legible con datos y firma visibles"
          uploadedDoc={ineFront}
          onDocChange={onFrontChange}
          mockFileName={`INE_Anverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`}
          mockFileSize="1.4 MB"
        />

        <DocumentUploadSlot
          label="Reverso (Vuelta)"
          sublabel="Parte posterior con código de barras / OCR"
          uploadedDoc={ineBack}
          onDocChange={onBackChange}
          mockFileName={`INE_Reverso_${expediente.contacto.nombre.split(' ')[0]}.jpg`}
          mockFileSize="1.2 MB"
        />
      </div>

      {/* Extracted Data Analysis Card */}
      <AnimatePresence>
        {isComplete && (
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
                  Datos leídos de la identificación
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-mono">
                INE Vigente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-teal-100/80 shadow-2xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Titular identificado</span>
                <span className="font-semibold text-zinc-900 block mt-0.5">
                  {expediente.contacto.nombre}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Vigencia electoral</span>
                <span className="font-medium text-emerald-700 block mt-0.5 font-mono">
                  2024 - 2034 (Vigente)
                </span>
              </div>

              <div className="sm:col-span-2 pt-1 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">
                  {isFisica ? 'Validación de identidad del solicitante' : 'Coincidencia de representante legal'}
                </span>
                <span className="text-teal-800 font-medium text-[11px] inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  {isFisica
                    ? `Coincide 100% con RFC (${expediente.empresa.rfc})`
                    : 'Representante registrado en acta constitutiva'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { DocumentUploadSlot } from './DocumentUploadSlot';
import { UploadedDoc } from './types';
import { Expediente } from '@/lib/types';

interface StepBankStatementsProps {
  expediente: Expediente;
  statements: {
    month1: UploadedDoc | null;
    month2: UploadedDoc | null;
    month3: UploadedDoc | null;
  };
  onStatementsChange: (statements: {
    month1: UploadedDoc | null;
    month2: UploadedDoc | null;
    month3: UploadedDoc | null;
  }) => void;
}

export function StepBankStatements({
  expediente,
  statements,
  onStatementsChange,
}: StepBankStatementsProps) {
  const isFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  const getPastMonthNames = () => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
      months.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    }
    return months;
  };

  const monthNames = getPastMonthNames();
  const allUploaded = Boolean(statements.month1 && statements.month2 && statements.month3);

  const handleUploadAllDemo = () => {
    const nowTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const bankPrefix = isFisica ? 'EdoCta_Personal' : 'EdoCta_Empresarial';
    onStatementsChange({
      month1: {
        name: `${bankPrefix}_${monthNames[0].replace(/ /g, '_')}_BBVA.pdf`,
        size: '2.4 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
      month2: {
        name: `${bankPrefix}_${monthNames[1].replace(/ /g, '_')}_BBVA.pdf`,
        size: '2.1 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
      month3: {
        name: `${bankPrefix}_${monthNames[2].replace(/ /g, '_')}_BBVA.pdf`,
        size: '2.3 MB',
        uploadedAt: nowTime,
        status: 'valid',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-medium mb-1">
            Paso 4 de 5
          </div>
          <button
            type="button"
            onClick={handleUploadAllDemo}
            className="text-[11px] font-medium text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/70 px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Cargar 3 meses de muestra</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          Estados de cuenta bancarios
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {isFisica ? (
            <>
              Sube los últimos 3 meses consecutivos en formato PDF de tu cuenta bancaria principal (nómina, cheques o depósitos de honorarios) a nombre de <strong className="text-zinc-900 font-medium">{expediente.contacto.nombre}</strong>.
            </>
          ) : (
            <>
              Sube los últimos 3 meses consecutivos en formato PDF de la cuenta operativa principal de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong>.
            </>
          )}
        </p>
      </div>

      <div className="space-y-4">
        <DocumentUploadSlot
          label={`Mes 1: ${monthNames[0]}`}
          sublabel="Estado de cuenta más reciente"
          uploadedDoc={statements.month1}
          onDocChange={(doc) => onStatementsChange({ ...statements, month1: doc })}
          mockFileName={`EdoCta_${monthNames[0].replace(/ /g, '_')}_BBVA.pdf`}
          mockFileSize="2.4 MB"
        />

        <DocumentUploadSlot
          label={`Mes 2: ${monthNames[1]}`}
          sublabel="Segundo mes consecutivo"
          uploadedDoc={statements.month2}
          onDocChange={(doc) => onStatementsChange({ ...statements, month2: doc })}
          mockFileName={`EdoCta_${monthNames[1].replace(/ /g, '_')}_BBVA.pdf`}
          mockFileSize="2.1 MB"
        />

        <DocumentUploadSlot
          label={`Mes 3: ${monthNames[2]}`}
          sublabel="Tercer mes consecutivo"
          uploadedDoc={statements.month3}
          onDocChange={(doc) => onStatementsChange({ ...statements, month3: doc })}
          mockFileName={`EdoCta_${monthNames[2].replace(/ /g, '_')}_BBVA.pdf`}
          mockFileSize="2.3 MB"
        />
      </div>

      {/* Extracted Bank Reconciliation Card */}
      <AnimatePresence>
        {allUploaded && (
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
                  Lectura y conciliación del trimestre
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-mono">
                3/3 Meses Consecutivos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-lg border border-teal-100/80 shadow-2xs">
              <div>
                <span className="text-zinc-500 block text-[11px]">Institución financiera</span>
                <span className="font-medium text-zinc-900 block mt-0.5">
                  BBVA México S.A.
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Cuenta CLABE identificada</span>
                <span className="font-mono text-zinc-900 block mt-0.5 font-medium">
                  012 180 0019482910 4
                </span>
              </div>

              <div className="sm:col-span-2 pt-1 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Periodo analizado: {monthNames[2]} - {monthNames[0]}</span>
                <span className="text-teal-800 font-medium text-[11px] inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  Titular coincide con RFC ({expediente.empresa.rfc})
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

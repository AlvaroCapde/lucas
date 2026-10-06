'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expediente } from '@/lib/types';

interface StepSatCredentialsProps {
  expediente: Expediente;
  siecKey: string;
  satValidated: boolean;
  onSiecKeyChange: (key: string) => void;
  onSatValidatedChange: (validated: boolean) => void;
}

export function StepSatCredentials({
  expediente,
  siecKey,
  satValidated,
  onSiecKeyChange,
  onSatValidatedChange,
}: StepSatCredentialsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStage, setValidationStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFisica = expediente.empresa.tipoPersona === 'persona_fisica';

  const handleTestConnection = () => {
    if (!siecKey || siecKey.trim().length < 4) {
      setErrorMessage('Ingresa la contraseña CIEC del SAT para continuar.');
      return;
    }

    setErrorMessage(null);
    setIsValidating(true);
    setValidationStage('Conectando de forma segura con el SAT...');

    setTimeout(() => {
      setValidationStage('Autenticando RFC y validando estatus fiscal...');
    }, 800);

    setTimeout(() => {
      setValidationStage('Conexión validada con éxito.');
      setIsValidating(false);
      onSatValidatedChange(true);
    }, 1600);
  };

  const handleDemoFill = () => {
    onSiecKeyChange('LucasSAT2026!');
    setErrorMessage(null);
    onSatValidatedChange(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-medium mb-1">
          Paso 3 de 5
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
          Autenticación SAT (Contraseña CIEC)
        </h2>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {isFisica ? (
            <>
              Ingresa la contraseña CIEC del portal del SAT de <strong className="text-zinc-900 font-medium">{expediente.contacto.nombre}</strong> ({expediente.empresa.rfc}) para agilizar la evaluación de tu crédito individual.
            </>
          ) : (
            <>
              Ingresa la contraseña CIEC del portal del SAT de <strong className="text-zinc-900 font-medium">{expediente.empresa.razonSocial}</strong> para agilizar la evaluación de tu crédito.
            </>
          )}
        </p>
      </div>

      {/* Explanatory & Confidentiality Notice Box */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 space-y-2 text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-zinc-900">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>¿Por qué solicitamos tu contraseña CIEC?</span>
        </div>
        <p className="text-zinc-600 text-[11px] leading-relaxed">
          {isFisica
            ? 'La contraseña CIEC nos permite consultar de forma automática y directa ante el SAT tus CFDIs de ingresos (honorarios, nómina o actividad comercial) y la Opinión de Cumplimiento (32-D), agilizando el trámite sin necesidad de recopilar declaraciones en papel.'
            : 'La contraseña CIEC nos permite consultar de forma automática y directa ante el SAT la facturación electrónica (CFDI) y la Opinión de Cumplimiento (32-D) de tu empresa, evitando que tengas que descargar y adjuntar cientos de archivos manualmente.'}
        </p>
        <p className="text-zinc-500 text-[11px] leading-relaxed pt-1 border-t border-zinc-200/60">
          <strong className="text-zinc-700 font-medium">Información 100% confidencial:</strong> Tus credenciales se transmiten mediante conexión cifrada de extremo a extremo y se utilizan exclusivamente para los fines de esta evaluación crediticia.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs">
        {/* RFC Display */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 block font-mono">
            {isFisica ? 'RFC del solicitante' : 'RFC de la empresa'}
          </label>
          <div className="px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-xs font-semibold text-zinc-900 flex items-center justify-between">
            <span>{expediente.empresa.rfc}</span>
            <span className="text-[11px] font-sans text-zinc-500 font-normal">
              {isFisica ? 'Persona Física' : 'Persona Moral'}
            </span>
          </div>
        </div>

        {/* CIEC Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 block font-mono">
              Contraseña CIEC del SAT
            </label>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[11px] font-medium text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100/80 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              Llenar clave de prueba
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={siecKey}
              onChange={(e) => {
                onSiecKeyChange(e.target.value);
                if (satValidated) onSatValidatedChange(false);
              }}
              placeholder="Contraseña alfanumérica del SAT"
              className="w-full h-10 pl-3.5 pr-10 rounded-lg border border-zinc-300 bg-white text-xs font-mono text-zinc-900 shadow-2xs focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
            <span>Clave alfanumérica de acceso al portal del SAT.</span>
            <a
              href="https://www.sat.gob.mx/tramites/38517/recupera-tu-contrasena"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-800 hover:underline flex items-center gap-1 font-medium"
            >
              <span>¿Olvidaste tu contraseña?</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Validation Action / Status */}
        <div className="pt-2">
          {isValidating ? (
            <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 flex items-center gap-2.5 text-xs text-teal-950 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-teal-700 shrink-0" />
              <span>{validationStage}</span>
            </div>
          ) : satValidated ? (
            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Credenciales SAT validadas correctamente</span>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                className="text-xs text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
              >
                Revalidar
              </button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleTestConnection}
              className="w-full text-xs font-medium py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Validar y conectar con el SAT
            </Button>
          )}

          {errorMessage && (
            <div className="mt-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ExpedienteStatus } from '@/lib/types';
import { CheckCircle2, Clock, Loader2, Send, ShieldAlert, Sparkles, XCircle, FileCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ExpedienteStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case 'aprobado_ia':
    case 'rechazado_ia':
    case 'esperando_aprobacion':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50/90 text-indigo-800 border border-indigo-200/90 tracking-tight',
            className
          )}
        >
          {showIcon && <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />}
          <span>Por Dictaminar</span>
        </span>
      );

    case 'credito_aprobado':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300/90 tracking-tight shadow-2xs',
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          <span>Aprobado</span>
        </span>
      );

    case 'credito_rechazado':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/80 tracking-tight',
            className
          )}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span>Crédito Rechazado</span>
        </span>
      );

    case 'completado':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 tracking-tight',
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          <span>Completado</span>
        </span>
      );

    case 'extrayendo':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80 tracking-tight',
            className
          )}
        >
          {showIcon && <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
          <span>Sincronizando SAT</span>
        </span>
      );

    case 'enlace_enviado':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200/70 tracking-tight',
            className
          )}
        >
          {showIcon && <Send className="w-3.5 h-3.5 text-sky-600" />}
          <span>Enlace Enviado</span>
        </span>
      );

    case 'esperando_credenciales':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50/70 text-amber-800 border border-amber-200/60 tracking-tight',
            className
          )}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          <span>Esperando CIEC</span>
        </span>
      );

    case 'requiere_atencion':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200/70 tracking-tight',
            className
          )}
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-red-600" />}
          <span>Requiere Atención</span>
        </span>
      );

    case 'pendiente_envio':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/80 tracking-tight',
            className
          )}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-zinc-500" />}
          <span>Borrador</span>
        </span>
      );
  }
}

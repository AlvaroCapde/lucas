'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Expediente } from '@/lib/types';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  expediente: Expediente | null;
  initialStep?: number;
  onCompleted?: () => void;
  onExtractionFinished?: (expedienteId: string) => void;
}

const tactileEase = [0.16, 1, 0.3, 1] as const;

export function ClientPortalModal({
  isOpen,
  onClose,
  expediente,
  initialStep = 0,
  onCompleted,
  onExtractionFinished,
}: ClientPortalModalProps) {
  if (!isOpen || !expediente) return null;

  const directUrl = `/onboarding/${expediente.tokenAcceso}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: tactileEase }}
          className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden z-10 my-4 flex flex-col max-h-[92vh]"
        >
          {/* Top Bar */}
          <div className="bg-zinc-950 text-zinc-300 px-4 py-2.5 flex items-center justify-between text-xs border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-zinc-400 font-mono text-[11px] truncate">
                Simulador del Portal del Cliente • {expediente.folio}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-teal-400 text-xs border border-zinc-700 transition-colors"
              >
                <span>Abrir en pestaña nueva</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Onboarding Flow */}
          <div className="flex-1 overflow-y-auto bg-zinc-100">
            <OnboardingFlow
              expediente={expediente}
              initialStep={initialStep}
              previewMode="responsive"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

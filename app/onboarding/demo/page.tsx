'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { INITIAL_EXPEDIENTES } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

function DemoContent() {
  const searchParams = useSearchParams();
  const viewMode = (searchParams.get('mode') as 'mobile' | 'responsive') || 'mobile';

  // Demo uses initial demo expediente (Fernando Mendoza / Transportes Logísticos del Bajío)
  const demoExpediente = INITIAL_EXPEDIENTES[0];

  return (
    <OnboardingFlow
      expediente={demoExpediente}
      previewMode={viewMode}
    />
  );
}

export default function OnboardingDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          <span className="text-xs font-mono">Iniciando simulador de onboarding...</span>
        </div>
      }
    >
      <DemoContent />
    </Suspense>
  );
}

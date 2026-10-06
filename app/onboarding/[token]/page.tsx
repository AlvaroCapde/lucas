'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useExpedientes } from '@/lib/expedientes-store';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { INITIAL_EXPEDIENTES } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

function TokenContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = Array.isArray(params?.token) ? params.token[0] : (params?.token as string);
  const viewMode = (searchParams.get('mode') as 'mobile' | 'responsive') || 'responsive';

  const { expedientes, isLoaded } = useExpedientes();

  // Find matching expediente by tokenAcceso or id
  const targetExpediente = React.useMemo(() => {
    if (!token) return INITIAL_EXPEDIENTES[0];

    // First check in current loaded store
    const found = expedientes.find(
      (e) => e.tokenAcceso === token || e.id === token || token === 'demo'
    );
    if (found) return found;

    // Fallback to initial mock data
    const initialFound = INITIAL_EXPEDIENTES.find(
      (e) => e.tokenAcceso === token || e.id === token
    );
    return initialFound || INITIAL_EXPEDIENTES[0];
  }, [token, expedientes]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
        <span className="text-xs font-mono">Cargando portal de onboarding cifrado...</span>
      </div>
    );
  }

  return (
    <OnboardingFlow
      expediente={targetExpediente}
      previewMode={viewMode}
    />
  );
}

export default function OnboardingTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
          <span className="text-xs font-mono">Cargando portal de onboarding cifrado...</span>
        </div>
      }
    >
      <TokenContent />
    </Suspense>
  );
}

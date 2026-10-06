'use client';

import * as React from 'react';

export interface DecisionProfile {
  id: string;
  nombre: string;
  codigo: string;
  version: string;
  entidad: string;
  sector: string;
  descripcion: string;
  estado: 'activo' | 'borrador' | 'archivado';
  actualizadoEn: string;
  promptPolitica: string;
  filtrosEliminatorios: {
    satOpinionPositiva: boolean;
    sinListasNegras69B: boolean;
    antiguedadMinimaMeses: number;
    maxDiasAtrasoBuro: number;
  };
  umbralesCuantitativos: {
    maxDtiRatio: number; // % máximo entre crédito solicitado y facturación anual
    maxClientConcentration: number; // % máximo facturado a un solo cliente
    minMonthlyCfdi: number; // Mínimo promedio de facturas emitidas por mes
    minFacturacionAnual: number; // En MXN
    plazoMaximoMeses: number;
  };
  politicaGarantias: {
    montoRequiereAval: number;
    tipoGarantiaSugerida: string;
    aforoFactoraje: string;
    requiereObligadoSolidario: boolean;
  };
  directricesIA: string[];
  metricas: {
    tasaAprobacion: number;
    expedientesEvaluados: number;
    tiempoPromedioSegundos: number;
  };
}

export const INITIAL_DECISION_PROFILES: DecisionProfile[] = [
  {
    id: 'profile-apy-transport',
    nombre: 'PyME Transporte & Logística Pesada',
    codigo: 'APY-TRN-24',
    version: 'v2.4',
    entidad: 'Apoyando Ideas',
    sector: 'Transporte, Carga y Logística',
    descripcion: 'Modelo optimizado para empresas de fletes, transportación y logística con verificación exhaustiva de CFDIs SAT y flujo de combustible/casetas.',
    estado: 'activo',
    actualizadoEn: '06 Oct 2026, 11:30',
    promptPolitica: `Prestamos a empresas de transporte con al menos 2 años de operaciones comprobables en el SAT.
Nos fijamos prioritariamente en:
1. Que el crédito solicitado no supere el 25% de la facturación anual verificada vía SAT.
2. Cero facturas con empresas en listas negras del Art. 69-B (EFOS/EDOS) y opinión 32-D estrictamente Positiva.
3. Cartera diversificada: ningún cliente principal debe representar más del 35% de sus ingresos.
4. Mínimo 15 facturas emitidas al mes para garantizar continuidad operativa y evitar empresas fantasma.
5. Para montos mayores a $2,000,000 MXN, requerimos obligatoriamente aval u obligado solidario del representante legal.`,
    filtrosEliminatorios: {
      satOpinionPositiva: true,
      sinListasNegras69B: true,
      antiguedadMinimaMeses: 24,
      maxDiasAtrasoBuro: 30,
    },
    umbralesCuantitativos: {
      maxDtiRatio: 25,
      maxClientConcentration: 35,
      minMonthlyCfdi: 15,
      minFacturacionAnual: 6000000,
      plazoMaximoMeses: 24,
    },
    politicaGarantias: {
      montoRequiereAval: 2000000,
      tipoGarantiaSugerida: 'Obligado Solidario (Representante Legal)',
      aforoFactoraje: '1.2 a 1',
      requiereObligadoSolidario: true,
    },
    directricesIA: [
      'Priorizar la recurrencia de emisión de CFDIs tipo Ingreso sobre picos esporádicos.',
      'Analizar los complementos de carta porte para validar existencia física de las rutas y flota.',
      'Si el solicitante pide más de $2.5M, recomendar plazo no mayor a 18 meses.',
      'Dictaminar con tono ejecutivo, directo y enfocado en la capacidad de servicio de la deuda para Apoyando Ideas.',
    ],
    metricas: {
      tasaAprobacion: 68.4,
      expedientesEvaluados: 142,
      tiempoPromedioSegundos: 2.1,
    },
  },
  {
    id: 'profile-apy-comercio',
    nombre: 'Comercio Mayorista & Distribución',
    codigo: 'APY-COM-24',
    version: 'v1.8',
    entidad: 'Apoyando Ideas',
    sector: 'Comercio al por mayor',
    descripcion: 'Enfocado en empresas comercializadoras y distribuidoras con rotación alta de inventario y líneas de crédito revolventes.',
    estado: 'borrador',
    actualizadoEn: '02 Oct 2026, 16:45',
    promptPolitica: `Para distribuidores mayoristas requerimos:
1. Relación de financiamiento vs ventas anuales de máximo 20%.
2. Constancia de situación fiscal sin omisiones y 32-D positiva.
3. Al menos 30 facturas emitidas al mes y facturación mínima de 10 millones de pesos anuales.
4. Concentración de clientes menor al 40%.
5. Garantía prendaria o fianza para montos sobre $3,000,000 MXN.`,
    filtrosEliminatorios: {
      satOpinionPositiva: true,
      sinListasNegras69B: true,
      antiguedadMinimaMeses: 36,
      maxDiasAtrasoBuro: 15,
    },
    umbralesCuantitativos: {
      maxDtiRatio: 20,
      maxClientConcentration: 40,
      minMonthlyCfdi: 30,
      minFacturacionAnual: 10000000,
      plazoMaximoMeses: 18,
    },
    politicaGarantias: {
      montoRequiereAval: 3000000,
      tipoGarantiaSugerida: 'Garantía Mobiliaria / Cesión de Derechos de Cobro',
      aforoFactoraje: '1.3 a 1',
      requiereObligadoSolidario: true,
    },
    directricesIA: [
      'Monitorear la rotación de cuentas por cobrar.',
      'Verificar estacionalidad trimestral para ajustar el calendario de amortización.',
    ],
    metricas: {
      tasaAprobacion: 54.1,
      expedientesEvaluados: 89,
      tiempoPromedioSegundos: 2.4,
    },
  },
];

const LOCAL_STORAGE_KEY = 'lucas_decision_profiles_v1';

export function useDecisionProfiles() {
  const [profiles, setProfiles] = React.useState<DecisionProfile[]>(INITIAL_DECISION_PROFILES);
  const [activeProfileId, setActiveProfileId] = React.useState<string>('profile-apy-transport');
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProfiles(parsed);
          const active = parsed.find((p: DecisionProfile) => p.estado === 'activo');
          if (active) setActiveProfileId(active.id);
        }
      }
    } catch (e) {
      console.error('Error loading decision profiles from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfiles = (updated: DecisionProfile[]) => {
    setProfiles(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving decision profiles to localStorage:', e);
    }
  };

  const activeProfile = React.useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  const updateProfile = (updatedProfile: DecisionProfile) => {
    const next = profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
    saveProfiles(next);
  };

  const setActiveProfile = (profileId: string) => {
    const next = profiles.map((p) => ({
      ...p,
      estado: p.id === profileId ? ('activo' as const) : ('borrador' as const),
    }));
    setActiveProfileId(profileId);
    saveProfiles(next);
  };

  const addProfile = (newProfile: DecisionProfile) => {
    const next = [newProfile, ...profiles];
    saveProfiles(next);
    setActiveProfileId(newProfile.id);
  };

  return {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfile,
    updateProfile,
    addProfile,
    isLoaded,
  };
}

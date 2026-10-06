'use client';

import * as React from 'react';
import { Expediente } from './types';
import { INITIAL_EXPEDIENTES } from './mock-data';

const STORAGE_KEY = 'lucas_expedientes_data_v1';

export function getStoredExpedientes(): Expediente[] {
  if (typeof window === 'undefined') return INITIAL_EXPEDIENTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EXPEDIENTES));
      return INITIAL_EXPEDIENTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading expedientes from localStorage', e);
    return INITIAL_EXPEDIENTES;
  }
}

export function saveStoredExpedientes(expedientes: Expediente[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expedientes));
    // Dispatch a storage event for same-window updates
    window.dispatchEvent(new Event('lucas_expedientes_updated'));
  } catch (e) {
    console.error('Error saving expedientes to localStorage', e);
  }
}

export function useExpedientes() {
  const [expedientes, setExpedientesState] = React.useState<Expediente[]>(INITIAL_EXPEDIENTES);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setExpedientesState(getStoredExpedientes());
    setIsLoaded(true);

    const handleStorageChange = () => {
      setExpedientesState(getStoredExpedientes());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('lucas_expedientes_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lucas_expedientes_updated', handleStorageChange);
    };
  }, []);

  const addExpediente = (newExp: Expediente) => {
    const current = getStoredExpedientes();
    const updated = [newExp, ...current];
    saveStoredExpedientes(updated);
    setExpedientesState(updated);
  };

  const updateExpediente = (updatedExp: Expediente) => {
    const current = getStoredExpedientes();
    const updated = current.map((e) => (e.id === updatedExp.id ? updatedExp : e));
    saveStoredExpedientes(updated);
    setExpedientesState(updated);
  };

  return {
    expedientes,
    isLoaded,
    addExpediente,
    updateExpediente,
  };
}

export function useSingleExpediente(id: string) {
  const { expedientes, isLoaded, updateExpediente } = useExpedientes();
  const expediente = React.useMemo(() => expedientes.find((e) => e.id === id) || null, [expedientes, id]);

  return {
    expediente,
    isLoaded,
    updateExpediente,
  };
}

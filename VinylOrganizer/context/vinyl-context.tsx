import { randomUUID } from 'expo-crypto';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

import * as vinylStorage from '@/storage/vinyl-storage';
import { VinylRecord } from '@/types/vinyl';

type VinylInput = Omit<VinylRecord, 'id' | 'createdAt' | 'updatedAt'>;

interface VinylContextValue {
  vinyls: VinylRecord[];
  isLoading: boolean;
  addVinyl: (data: VinylInput) => Promise<void>;
  updateVinyl: (id: string, data: Partial<VinylInput>) => Promise<void>;
  deleteVinyl: (id: string) => Promise<void>;
}

const VinylContext = createContext<VinylContextValue | null>(null);

export function VinylProvider({ children }: PropsWithChildren) {
  const [vinyls, setVinyls] = useState<VinylRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVinyls = useCallback(async () => {
    setIsLoading(true);
    const data = await vinylStorage.getAllVinyls();
    setVinyls(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadVinyls();
  }, [loadVinyls]);

  const addVinyl = useCallback(async (data: VinylInput) => {
    const now = new Date().toISOString();
    const vinyl: VinylRecord = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await vinylStorage.saveVinyl(vinyl);
    setVinyls((prev) => [...prev, vinyl]);
  }, []);

  const updateVinyl = useCallback(async (id: string, data: Partial<VinylInput>) => {
    const existing = vinyls.find((v) => v.id === id);
    if (!existing) return;
    const updated: VinylRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await vinylStorage.saveVinyl(updated);
    setVinyls((prev) => prev.map((v) => (v.id === id ? updated : v)));
  }, [vinyls]);

  const deleteVinyl = useCallback(async (id: string) => {
    await vinylStorage.deleteVinyl(id);
    setVinyls((prev) => prev.filter((v) => v.id !== id));
  }, []);

  return (
    <VinylContext.Provider value={{ vinyls, isLoading, addVinyl, updateVinyl, deleteVinyl }}>
      {children}
    </VinylContext.Provider>
  );
}

export function useVinyls() {
  const context = useContext(VinylContext);
  if (!context) {
    throw new Error('useVinyls must be used within a VinylProvider');
  }
  return context;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

import { VinylRecord } from '@/types/vinyl';

import { STORAGE_KEYS } from './storage-keys';

export async function getAllVinyls(): Promise<VinylRecord[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.VINYL_COLLECTION);
  if (!json) return [];
  return JSON.parse(json);
}

export async function getVinylById(id: string): Promise<VinylRecord | null> {
  const vinyls = await getAllVinyls();
  return vinyls.find((v) => v.id === id) ?? null;
}

export async function saveVinyl(vinyl: VinylRecord): Promise<void> {
  const vinyls = await getAllVinyls();
  const index = vinyls.findIndex((v) => v.id === vinyl.id);
  if (index >= 0) {
    vinyls[index] = vinyl;
  } else {
    vinyls.push(vinyl);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.VINYL_COLLECTION, JSON.stringify(vinyls));
}

export async function deleteVinyl(id: string): Promise<void> {
  const vinyls = await getAllVinyls();
  const filtered = vinyls.filter((v) => v.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.VINYL_COLLECTION, JSON.stringify(filtered));
}

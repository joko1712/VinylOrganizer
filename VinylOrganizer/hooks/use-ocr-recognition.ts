import type { CameraView } from 'expo-camera';
import { File } from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import MlkitOcr from 'rn-mlkit-ocr';

import { AlbumSearchResult, searchVinylsQuick } from '@/services/discogs';
import { extractBestQuery, normalizeQuery } from '@/services/ocr-text-processor';

export type OcrStatus = 'inactive' | 'capturing' | 'recognizing' | 'searching';

const OCR_INTERVAL_MS = 3500;
const QUERY_COOLDOWN_MS = 30_000;
const MIN_SEARCH_GAP_MS = 5_000;

interface UseOcrRecognitionOptions {
  cameraRef: React.RefObject<CameraView | null>;
  enabled: boolean;
  scanStateKind: string;
}

interface UseOcrRecognitionReturn {
  ocrStatus: OcrStatus;
  ocrResults: AlbumSearchResult[] | null;
  ocrQuery: string | null;
  dismissOcrResults: () => void;
}

function cleanupPhoto(uri: string) {
  try {
    const path = uri.startsWith('file://') ? uri.slice(7) : uri;
    const file = new File(path);
    if (file.exists) file.delete();
  } catch {
  }
}

export function useOcrRecognition({
  cameraRef,
  enabled,
  scanStateKind,
}: UseOcrRecognitionOptions): UseOcrRecognitionReturn {
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('inactive');
  const [ocrResults, setOcrResults] = useState<AlbumSearchResult[] | null>(null);
  const [ocrQuery, setOcrQuery] = useState<string | null>(null);

  const recentQueries = useRef<Map<string, number>>(new Map());
  const lastSearchTime = useRef(0);
  const processingRef = useRef(false);

  const isIdle = scanStateKind === 'idle';
  const canRun = enabled && isIdle && !ocrResults;

  const isDuplicateQuery = useCallback((query: string): boolean => {
    const normalized = normalizeQuery(query);
    const now = Date.now();

    for (const [key, timestamp] of recentQueries.current) {
      if (now - timestamp > QUERY_COOLDOWN_MS) {
        recentQueries.current.delete(key);
      }
    }

    if (recentQueries.current.has(normalized)) return true;
    if (now - lastSearchTime.current < MIN_SEARCH_GAP_MS) return true;

    return false;
  }, []);

  const recordQuery = useCallback((query: string) => {
    recentQueries.current.set(normalizeQuery(query), Date.now());
    lastSearchTime.current = Date.now();
  }, []);

  const dismissOcrResults = useCallback(() => {
    setOcrResults(null);
    setOcrQuery(null);
    setOcrStatus('inactive');
  }, []);

  useEffect(() => {
    if (!canRun) return;

    const runOcrCycle = async () => {
      if (processingRef.current || !cameraRef.current) return;
      processingRef.current = true;

      let photoUri: string | null = null;

      try {
        setOcrStatus('capturing');

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          shutterSound: false,
        });

        if (!photo?.uri) {
          setOcrStatus('inactive');
          return;
        }

        photoUri = photo.uri;

        setOcrStatus('recognizing');
        const result = await MlkitOcr.recognizeText(photo.uri);

        if (result.text.trim().length < 3) {
          setOcrStatus('inactive');
          return;
        }

        const query = extractBestQuery(result);

        if (!query || isDuplicateQuery(query)) {
          setOcrStatus('inactive');
          return;
        }

        setOcrStatus('searching');
        recordQuery(query);

        const results = await searchVinylsQuick(query);

        if (results.length > 0) {
          setOcrQuery(query);
          setOcrResults(results);
        }

        setOcrStatus('inactive');
      } catch {
        setOcrStatus('inactive');
      } finally {
        processingRef.current = false;
        if (photoUri) cleanupPhoto(photoUri);
      }
    };

    const timer = setInterval(runOcrCycle, OCR_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [canRun, cameraRef, isDuplicateQuery, recordQuery]);

  useEffect(() => {
    if (!enabled || !isIdle) {
      setOcrStatus('inactive');
      processingRef.current = false;
    }
  }, [enabled, isIdle]);

  return { ocrStatus, ocrResults, ocrQuery, dismissOcrResults };
}

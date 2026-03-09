import { AlbumSearchResult } from './discogs';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const SIMILARITY_THRESHOLD = 0.75;

export type RecognitionSource = 'clip' | 'barcode' | 'ocr' | 'manual';

export interface RecognitionResult {
  source: RecognitionSource;
  results: AlbumSearchResult[];
  topSimilarity: number;
  ocrText: string;
}

interface BackendResult {
  discogs_id: number;
  title: string;
  album_name: string;
  artist: string;
  year: string;
  genre: string[];
  country: string;
  cover_image: string | null;
  similarity: number;
}

interface BackendResponse {
  success: boolean;
  query?: string;
  ocr_text?: string;
  results: BackendResult[];
  error?: string;
}

export async function recognizeByImage(
  imageUri: string,
): Promise<RecognitionResult> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await fetch(`${BACKEND_URL}/recognize`, {
      method: 'POST',
      body: formData,
    });

    const data: BackendResponse = await response.json();
    console.log('[recognition] Backend response:', JSON.stringify(data, null, 2));

    const ocrText = data.ocr_text || data.query || '';

    if (!data.success || !data.results?.length) {
      console.warn('[recognition] No results:', data.error || 'empty');
      return { source: 'clip', results: [], topSimilarity: 0, ocrText };
    }

    const results: AlbumSearchResult[] = data.results.map((r) => ({
      discogsId: r.discogs_id,
      albumName: r.album_name || r.title,
      artist: r.artist,
      year: r.year || '',
      genre: Array.isArray(r.genre) ? r.genre[0] || '' : '',
      coverImageUri: r.cover_image,
    }));

    return {
      source: 'clip',
      results,
      topSimilarity: data.results[0].similarity,
      ocrText,
    };
  } catch (error) {
    console.warn('Recognition API error:', error);
    throw error; 
  }
}

export function isConfidentMatch(result: RecognitionResult): boolean {
  return result.topSimilarity >= SIMILARITY_THRESHOLD;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

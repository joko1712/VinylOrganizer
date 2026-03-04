import type { OcrResult } from 'rn-mlkit-ocr';

export function extractBestQuery(ocrResult: OcrResult): string | null {
  if (!ocrResult.blocks.length) return null;

  const sortedBlocks = [...ocrResult.blocks].sort((a, b) => {
    const areaA = a.frame.width * a.frame.height;
    const areaB = b.frame.width * b.frame.height;
    return areaB - areaA;
  });

  const topBlocks = sortedBlocks.slice(0, 2);
  const rawText = topBlocks.map((b) => b.text).join(' ');

  const cleaned = rawText
    .replace(/\b[A-Z]{1,3}[-\s]?\d{3,6}\b/g, '')
    .replace(/\b\d{5,}\b/g, '') 
    .replace(/\b(stereo|mono|33|45|rpm|lp|ep|gatefold|remaster(ed)?)\b/gi, '')
    .replace(/[^\w\s'-]/g, ' ') 
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length < 3) return null;

  return cleaned.slice(0, 60).trim();
}

export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const BASE_URL = 'https://api.discogs.com';
const USER_AGENT = 'VinylOrganizer/1.0';

const headers = { 'User-Agent': USER_AGENT };

export interface AlbumSearchResult {
  discogsId: number;
  albumName: string;
  artist: string;
  year: string;
  genre: string;
  coverImageUri: string | null;
}

interface DiscogsSearchResponse {
  results: Array<{
    id: number;
    title: string;
    year?: string;
    genre?: string[];
    resource_url: string;
  }>;
}

interface DiscogsReleaseResponse {
  id: number;
  title: string;
  year?: number;
  artists?: Array<{ name: string }>;
  genres?: string[];
  images?: Array<{ type: string; uri: string; uri150: string }>;
  thumb?: string;
}

export async function fetchReleaseCover(resourceUrl: string): Promise<string | null> {
  try {
    const response = await fetch(resourceUrl, { headers });
    if (!response.ok) return null;
    const data: DiscogsReleaseResponse = await response.json();
    const primary = data.images?.find((img) => img.type === 'primary');
    return primary?.uri ?? data.images?.[0]?.uri ?? data.thumb ?? null;
  } catch {
    return null;
  }
}

async function parseAndEnrichResults(data: DiscogsSearchResponse): Promise<AlbumSearchResult[]> {
  const parsed = data.results.map((item) => {
    const [artist, ...albumParts] = item.title.split(' - ');
    const albumName = albumParts.join(' - ') || artist;

    return {
      discogsId: item.id,
      albumName: albumParts.length > 0 ? albumName : item.title,
      artist: albumParts.length > 0 ? artist.trim() : '',
      year: item.year ?? '',
      genre: item.genre?.[0] ?? '',
      resourceUrl: item.resource_url,
    };
  });

  const covers = await Promise.all(
    parsed.map((item) => fetchReleaseCover(item.resourceUrl)),
  );

  return parsed.map((item, i) => ({
    discogsId: item.discogsId,
    albumName: item.albumName,
    artist: item.artist,
    year: item.year,
    genre: item.genre,
    coverImageUri: covers[i],
  }));
}

export async function searchVinyls(query: string): Promise<AlbumSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    type: 'release',
    format: 'Vinyl',
    per_page: '5',
  });

  const response = await fetch(`${BASE_URL}/database/search?${params}`, { headers });

  if (!response.ok) {
    throw new Error(`Discogs search failed: ${response.status}`);
  }

  const data: DiscogsSearchResponse = await response.json();
  return parseAndEnrichResults(data);
}

export async function searchByBarcode(barcode: string): Promise<AlbumSearchResult[]> {
  if (!barcode.trim()) return [];

  const params = new URLSearchParams({
    barcode: barcode.trim(),
    type: 'release',
    per_page: '5',
  });

  const response = await fetch(`${BASE_URL}/database/search?${params}`, { headers });

  if (!response.ok) {
    throw new Error(`Discogs barcode search failed: ${response.status}`);
  }

  const data: DiscogsSearchResponse = await response.json();
  return parseAndEnrichResults(data);
}

export async function searchVinylsQuick(query: string): Promise<AlbumSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    type: 'release',
    format: 'Vinyl',
    per_page: '3',
  });

  const response = await fetch(`${BASE_URL}/database/search?${params}`, { headers });

  if (!response.ok) {
    throw new Error(`Discogs search failed: ${response.status}`);
  }

  const data: DiscogsSearchResponse = await response.json();

  return data.results.slice(0, 3).map((item) => {
    const [artist, ...albumParts] = item.title.split(' - ');
    return {
      discogsId: item.id,
      albumName: albumParts.length > 0 ? albumParts.join(' - ') : item.title,
      artist: albumParts.length > 0 ? artist.trim() : '',
      year: item.year ?? '',
      genre: item.genre?.[0] ?? '',
      coverImageUri: null,
    };
  });
}

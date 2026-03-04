export interface VinylRecord {
  id: string;
  albumName: string;
  artist: string;
  year: number | null;
  genre: string;
  coverImageUri: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

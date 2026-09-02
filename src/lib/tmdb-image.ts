const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TMDBImageSize = "w92" | "w154" | "w185" | "w300" | "w500" | "original";

export function tmdbImageUrl(
  path: string | null,
  size: TMDBImageSize = "w500",
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

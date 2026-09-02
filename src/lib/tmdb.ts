import "server-only";

export { tmdbImageUrl } from "@/lib/tmdb-image";

const TMDB_API_BASE = "https://api.themoviedb.org/3";

export interface TMDBShowSummary {
  id: number;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: string | null;
  genreIds: number[];
}

export interface TMDBShowDetails extends TMDBShowSummary {
  status: string;
  genres: { id: number; name: string }[];
  numberOfSeasons: number;
  seasons: {
    seasonNumber: number;
    name: string;
    episodeCount: number;
    airDate: string | null;
    posterPath: string | null;
  }[];
}

export interface TMDBEpisode {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  stillPath: string | null;
}

export interface TMDBSeasonDetails {
  id: number;
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string | null;
  episodes: TMDBEpisode[];
}

class TMDBError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "TMDBError";
  }
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidateSeconds = 60 * 60 * 24,
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not set");
  }

  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "fr-FR");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    throw new TMDBError(`TMDB request failed: ${path}`, res.status);
  }
  return res.json() as Promise<T>;
}

interface RawShowSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  genre_ids: number[];
}

function mapShowSummary(raw: RawShowSummary): TMDBShowSummary {
  return {
    id: raw.id,
    name: raw.name,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    firstAirDate: raw.first_air_date,
    genreIds: raw.genre_ids,
  };
}

export async function searchShows(query: string): Promise<TMDBShowSummary[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<{ results: RawShowSummary[] }>(
    "/search/tv",
    { query },
    0, // search results shouldn't be cached
  );
  return data.results.map(mapShowSummary);
}

export async function getShowDetails(
  tmdbId: number,
): Promise<TMDBShowDetails> {
  const raw = await tmdbFetch<
    RawShowSummary & {
      status: string;
      genres: { id: number; name: string }[];
      number_of_seasons: number;
      seasons: {
        season_number: number;
        name: string;
        episode_count: number;
        air_date: string | null;
        poster_path: string | null;
      }[];
    }
  >(`/tv/${tmdbId}`);

  return {
    ...mapShowSummary(raw),
    status: raw.status,
    genres: raw.genres,
    numberOfSeasons: raw.number_of_seasons,
    seasons: raw.seasons
      .filter((s) => s.season_number > 0) // skip "Specials"
      .map((s) => ({
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: s.air_date,
        posterPath: s.poster_path,
      })),
  };
}

export async function getSeasonDetails(
  tmdbId: number,
  seasonNumber: number,
): Promise<TMDBSeasonDetails> {
  const raw = await tmdbFetch<{
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    air_date: string | null;
    episodes: {
      id: number;
      season_number: number;
      episode_number: number;
      name: string;
      overview: string;
      air_date: string | null;
      still_path: string | null;
    }[];
  }>(`/tv/${tmdbId}/season/${seasonNumber}`);

  return {
    id: raw.id,
    seasonNumber,
    name: raw.name,
    overview: raw.overview,
    posterPath: raw.poster_path,
    airDate: raw.air_date,
    episodes: raw.episodes.map((ep) => ({
      id: ep.id,
      seasonNumber: ep.season_number,
      episodeNumber: ep.episode_number,
      name: ep.name,
      overview: ep.overview,
      airDate: ep.air_date,
      stillPath: ep.still_path,
    })),
  };
}

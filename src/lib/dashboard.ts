import "server-only";
import { prisma } from "@/lib/prisma";
import type { DashboardShow } from "@/lib/dashboard-types";

export type { DashboardShow } from "@/lib/dashboard-types";
export { statusRank } from "@/lib/dashboard-types";

function relativeDateLabel(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

export async function getDashboardShows(userId: string): Promise<DashboardShow[]> {
  const [userShows, watchProgress] = await Promise.all([
    prisma.userShow.findMany({
      where: { userId },
      include: {
        show: {
          include: {
            episodes: {
              orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
            },
          },
        },
      },
    }),
    prisma.watchProgress.findMany({ where: { userId } }),
  ]);

  const watchedByShow = new Map<string, Set<string>>();
  const lastWatchedByShow = new Map<string, Date>();
  for (const wp of watchProgress) {
    if (!watchedByShow.has(wp.showId)) watchedByShow.set(wp.showId, new Set());
    watchedByShow.get(wp.showId)!.add(wp.episodeId);
    const current = lastWatchedByShow.get(wp.showId);
    if (!current || wp.watchedAt > current) lastWatchedByShow.set(wp.showId, wp.watchedAt);
  }

  return userShows.map((us) => {
    const { show } = us;
    const watchedIds = watchedByShow.get(show.id) ?? new Set<string>();
    const episodes = show.episodes;
    const totalEpisodes = episodes.length;
    const watchedEpisodes = episodes.filter((ep) => watchedIds.has(ep.id)).length;

    const nextEpisode = episodes.find((ep) => !watchedIds.has(ep.id));
    const currentSeasonNumber = nextEpisode
      ? nextEpisode.seasonNumber
      : (episodes.at(-1)?.seasonNumber ?? 1);
    const seasonEpisodes = episodes.filter(
      (ep) => ep.seasonNumber === currentSeasonNumber,
    );
    const episodeOrdinal = nextEpisode
      ? seasonEpisodes.findIndex((ep) => ep.id === nextEpisode.id) + 1
      : seasonEpisodes.length;

    const lastWatchedAt = lastWatchedByShow.get(show.id) ?? us.createdAt;

    return {
      id: show.id,
      title: show.title,
      year: show.firstAirDate ? show.firstAirDate.getFullYear() : null,
      genres: show.genres,
      status: us.status,
      posterPath: show.posterPath,
      seasonNumber: currentSeasonNumber,
      episodeOrdinal,
      episodeTotal: seasonEpisodes.length,
      watchedEpisodes,
      totalEpisodes,
      activityLabel: relativeDateLabel(lastWatchedAt),
      activityRank: -lastWatchedAt.getTime(),
    };
  });
}

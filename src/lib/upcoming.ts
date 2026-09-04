import "server-only";
import { prisma } from "@/lib/prisma";

export interface UpcomingSeason {
  showId: string;
  showTitle: string;
  posterPath: string | null;
  seasonNumber: number;
  seasonName: string | null;
  airDate: Date;
  dateLabel: string;
  countdownLabel: string;
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCountdown(date: Date): string {
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  return `Dans ${days} jours`;
}

export async function getUpcomingSeasons(userId: string): Promise<UpcomingSeason[]> {
  const userShows = await prisma.userShow.findMany({
    where: { userId },
    include: {
      show: {
        include: {
          seasons: { where: { airDate: { gt: new Date() } } },
        },
      },
    },
  });

  const items: UpcomingSeason[] = [];
  for (const us of userShows) {
    for (const season of us.show.seasons) {
      if (!season.airDate) continue;
      items.push({
        showId: us.show.id,
        showTitle: us.show.title,
        posterPath: us.show.posterPath,
        seasonNumber: season.seasonNumber,
        seasonName: season.name,
        airDate: season.airDate,
        dateLabel: formatDateLabel(season.airDate),
        countdownLabel: formatCountdown(season.airDate),
      });
    }
  }

  return items.sort((a, b) => a.airDate.getTime() - b.airDate.getTime());
}

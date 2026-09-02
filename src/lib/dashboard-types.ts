import type { ShowStatus } from "@/generated/prisma/enums";

export interface DashboardShow {
  id: string;
  title: string;
  year: number | null;
  genres: string[];
  status: ShowStatus;
  posterPath: string | null;
  seasonNumber: number;
  episodeOrdinal: number;
  episodeTotal: number;
  watchedEpisodes: number;
  totalEpisodes: number;
  activityLabel: string;
  activityRank: number;
}

const STATUS_RANK: Record<ShowStatus, number> = {
  WATCHING: 0,
  PAUSED: 1,
  COMPLETED: 2,
};

export function statusRank(status: ShowStatus): number {
  return STATUS_RANK[status];
}

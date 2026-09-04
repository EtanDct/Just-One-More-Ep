"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getShowDetails, getSeasonDetails } from "@/lib/tmdb";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user.id;
}

// Keeps UserShow.status honest after a watch-progress change: flips to
// COMPLETED once every episode is watched, and back to WATCHING the moment
// that stops being true (e.g. an episode gets unchecked, or a new episode
// airs and gets cached). Never touches PAUSED — that's a deliberate choice
// only the user makes, not something progress alone implies.
async function syncShowStatus(userId: string, showId: string) {
  const [totalCount, watchedCount, userShow] = await Promise.all([
    prisma.episode.count({ where: { showId } }),
    prisma.watchProgress.count({ where: { userId, showId } }),
    prisma.userShow.findUnique({
      where: { userId_showId: { userId, showId } },
      select: { status: true },
    }),
  ]);

  if (!userShow) return;

  const allWatched = totalCount > 0 && watchedCount >= totalCount;
  if (allWatched && userShow.status !== "COMPLETED") {
    await prisma.userShow.update({
      where: { userId_showId: { userId, showId } },
      data: { status: "COMPLETED" },
    });
  } else if (!allWatched && userShow.status === "COMPLETED") {
    await prisma.userShow.update({
      where: { userId_showId: { userId, showId } },
      data: { status: "WATCHING" },
    });
  }
}

export async function toggleEpisodeAction(episodeId: string, watched: boolean) {
  const userId = await requireUserId();
  const episode = await prisma.episode.findUniqueOrThrow({
    where: { id: episodeId },
    select: { showId: true },
  });

  if (watched) {
    await prisma.watchProgress.upsert({
      where: { userId_episodeId: { userId, episodeId } },
      create: { userId, episodeId, showId: episode.showId },
      update: {},
    });
  } else {
    await prisma.watchProgress.deleteMany({ where: { userId, episodeId } });
  }

  await syncShowStatus(userId, episode.showId);

  revalidatePath(`/shows/${episode.showId}`);
  revalidatePath("/dashboard");
}

export async function toggleSeasonAction(
  showId: string,
  seasonNumber: number,
  watched: boolean,
) {
  const userId = await requireUserId();
  const episodes = await prisma.episode.findMany({
    where: { showId, seasonNumber },
    select: { id: true },
  });

  if (watched) {
    await prisma.watchProgress.createMany({
      data: episodes.map((ep) => ({ userId, episodeId: ep.id, showId })),
      skipDuplicates: true,
    });
  } else {
    await prisma.watchProgress.deleteMany({
      where: { userId, showId, episodeId: { in: episodes.map((e) => e.id) } },
    });
  }

  await syncShowStatus(userId, showId);

  revalidatePath(`/shows/${showId}`);
  revalidatePath("/dashboard");
}

export async function removeShowAction(showId: string) {
  const userId = await requireUserId();
  await prisma.userShow.delete({
    where: { userId_showId: { userId, showId } },
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// Re-fetches a show from TMDB and upserts its seasons/episodes — the cache
// written at add-time (search/actions.ts) never updates itself otherwise,
// so a newly-announced season or a just-aired episode would never show up.
export async function refreshShowAction(showId: string) {
  await requireUserId();
  const show = await prisma.show.findUniqueOrThrow({ where: { id: showId } });
  const details = await getShowDetails(show.tmdbId);

  await prisma.show.update({
    where: { id: showId },
    data: {
      title: details.name,
      overview: details.overview || null,
      posterPath: details.posterPath,
      backdropPath: details.backdropPath,
      firstAirDate: details.firstAirDate ? new Date(details.firstAirDate) : null,
      genres: details.genres.map((g) => g.name),
    },
  });

  for (const s of details.seasons) {
    const season = await prisma.season.upsert({
      where: { showId_seasonNumber: { showId, seasonNumber: s.seasonNumber } },
      create: {
        showId,
        seasonNumber: s.seasonNumber,
        name: s.name || null,
        posterPath: s.posterPath,
        airDate: s.airDate ? new Date(s.airDate) : null,
      },
      update: {
        name: s.name || null,
        posterPath: s.posterPath,
        airDate: s.airDate ? new Date(s.airDate) : null,
      },
    });

    const seasonDetails = await getSeasonDetails(show.tmdbId, s.seasonNumber);
    for (const ep of seasonDetails.episodes) {
      await prisma.episode.upsert({
        where: { tmdbId: ep.id },
        create: {
          tmdbId: ep.id,
          showId,
          seasonId: season.id,
          seasonNumber: ep.seasonNumber,
          episodeNumber: ep.episodeNumber,
          name: ep.name || null,
          overview: ep.overview || null,
          stillPath: ep.stillPath,
          airDate: ep.airDate ? new Date(ep.airDate) : null,
        },
        update: {
          name: ep.name || null,
          overview: ep.overview || null,
          stillPath: ep.stillPath,
          airDate: ep.airDate ? new Date(ep.airDate) : null,
        },
      });
    }
  }

  revalidatePath(`/shows/${showId}`);
  revalidatePath("/dashboard");
  revalidatePath("/upcoming");
}

export async function setRatingAction(showId: string, rating: number) {
  const userId = await requireUserId();
  await prisma.userShow.update({
    where: { userId_showId: { userId, showId } },
    data: { rating },
  });
  revalidatePath(`/shows/${showId}`);
}

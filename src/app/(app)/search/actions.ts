"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getShowDetails, getSeasonDetails } from "@/lib/tmdb";

async function getOrCreateShow(tmdbId: number) {
  const existing = await prisma.show.findUnique({ where: { tmdbId } });
  if (existing) return existing;

  const details = await getShowDetails(tmdbId);

  const show = await prisma.show.create({
    data: {
      tmdbId: details.id,
      title: details.name,
      overview: details.overview || null,
      posterPath: details.posterPath,
      backdropPath: details.backdropPath,
      firstAirDate: details.firstAirDate ? new Date(details.firstAirDate) : null,
      genres: details.genres.map((g) => g.name),
    },
  });

  for (const s of details.seasons) {
    const seasonDetails = await getSeasonDetails(tmdbId, s.seasonNumber);

    const season = await prisma.season.create({
      data: {
        showId: show.id,
        seasonNumber: s.seasonNumber,
        name: s.name || null,
        posterPath: s.posterPath,
        airDate: s.airDate ? new Date(s.airDate) : null,
      },
    });

    if (seasonDetails.episodes.length > 0) {
      await prisma.episode.createMany({
        data: seasonDetails.episodes.map((ep) => ({
          tmdbId: ep.id,
          showId: show.id,
          seasonId: season.id,
          seasonNumber: ep.seasonNumber,
          episodeNumber: ep.episodeNumber,
          name: ep.name || null,
          overview: ep.overview || null,
          stillPath: ep.stillPath,
          airDate: ep.airDate ? new Date(ep.airDate) : null,
        })),
      });
    }
  }

  return show;
}

export async function addShowAction(tmdbId: number) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const show = await getOrCreateShow(tmdbId);

  await prisma.userShow.upsert({
    where: { userId_showId: { userId: session.user.id, showId: show.id } },
    create: { userId: session.user.id, showId: show.id },
    update: {},
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

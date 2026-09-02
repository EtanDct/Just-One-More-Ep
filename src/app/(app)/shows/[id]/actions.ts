"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user.id;
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

  revalidatePath(`/shows/${showId}`);
  revalidatePath("/dashboard");
}

export async function setRatingAction(showId: string, rating: number) {
  const userId = await requireUserId();
  await prisma.userShow.update({
    where: { userId_showId: { userId, showId } },
    data: { rating },
  });
  revalidatePath(`/shows/${showId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markNextEpisodeWatchedAction(showId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const episodes = await prisma.episode.findMany({
    where: { showId },
    orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
    select: { id: true },
  });

  const watched = await prisma.watchProgress.findMany({
    where: { userId: session.user.id, showId },
    select: { episodeId: true },
  });
  const watchedIds = new Set(watched.map((w) => w.episodeId));

  const next = episodes.find((ep) => !watchedIds.has(ep.id));
  if (!next) return;

  await prisma.watchProgress.create({
    data: { userId: session.user.id, showId, episodeId: next.id },
  });

  revalidatePath("/dashboard");
}

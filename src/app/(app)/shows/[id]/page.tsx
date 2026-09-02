import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { StatusBadge, GenreTag } from "@/components/status-badge";
import { PosterPlaceholder } from "@/components/poster-placeholder";
import { RatingStars } from "./rating-stars";
import { SeasonBlock } from "./season-block";

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userShow = await prisma.userShow.findUnique({
    where: { userId_showId: { userId: session.user.id, showId: id } },
    include: {
      show: {
        include: {
          seasons: { orderBy: { seasonNumber: "asc" } },
          episodes: {
            orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }],
          },
        },
      },
    },
  });

  if (!userShow) notFound();

  const watchProgress = await prisma.watchProgress.findMany({
    where: { userId: session.user.id, showId: id },
    select: { episodeId: true },
  });
  const watchedIds = new Set(watchProgress.map((w) => w.episodeId));

  const { show } = userShow;
  const year = show.firstAirDate ? show.firstAirDate.getFullYear() : null;
  const backdropUrl = tmdbImageUrl(show.backdropPath, "original");
  const posterUrl = tmdbImageUrl(show.posterPath, "w300");

  const seasons = show.seasons
    .map((season) => ({
      season,
      episodes: show.episodes
        .filter((ep) => ep.seasonNumber === season.seasonNumber)
        .map((ep) => ({
          id: ep.id,
          number: ep.episodeNumber,
          watched: watchedIds.has(ep.id),
        })),
    }))
    .filter((s) => s.episodes.length > 0); // hide seasons that haven't aired yet

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary"
      >
        <ArrowLeft className="size-4" />
        Retour
      </Link>

      <div className="relative mb-20 h-72">
        <div className="absolute inset-0 overflow-hidden rounded-3xl bg-secondary">
          {backdropUrl && (
            <Image src={backdropUrl} alt="" fill priority className="object-cover" />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to top, var(--background) 10%, transparent 65%)",
            }}
          />
        </div>
        <div className="absolute -bottom-16 left-6 flex items-end gap-4">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              width={140}
              height={210}
              className="flex-none rounded-2xl shadow-elev-lg"
            />
          ) : (
            <PosterPlaceholder className="h-[210px] w-[140px]" />
          )}
          <div className="pb-2">
            <h1 className="mb-1.5">{show.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {year && <span className="text-muted-foreground">{year}</span>}
              <StatusBadge status={userShow.status} />
              {show.genres.map((g) => (
                <GenreTag key={g}>{g}</GenreTag>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RatingStars showId={show.id} rating={userShow.rating ?? 0} />

      <div className="flex flex-col gap-8">
        {seasons.map(({ season, episodes }) => (
          <SeasonBlock
            key={season.id}
            showId={show.id}
            seasonNumber={season.seasonNumber}
            episodes={episodes}
          />
        ))}
      </div>
    </div>
  );
}

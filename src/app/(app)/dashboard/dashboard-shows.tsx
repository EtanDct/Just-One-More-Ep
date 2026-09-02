"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import type { DashboardShow } from "@/lib/dashboard-types";
import { statusRank } from "@/lib/dashboard-types";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { markNextEpisodeWatchedAction } from "./actions";
import { StatusBadge, GenreTag } from "@/components/status-badge";
import { PosterPlaceholder } from "@/components/poster-placeholder";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortMode = "activity" | "status";

const PROGRESS_COLOR: Record<DashboardShow["status"], string> = {
  WATCHING: "bg-brand",
  PAUSED: "bg-brand2",
  COMPLETED: "bg-neutral-500",
};

export function DashboardShows({ shows }: { shows: DashboardShow[] }) {
  const [sort, setSort] = useState<SortMode>("activity");

  const sorted = useMemo(() => {
    return [...shows].sort((a, b) =>
      sort === "activity"
        ? a.activityRank - b.activityRank
        : statusRank(a.status) - statusRank(b.status),
    );
  }, [shows, sort]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1">Reprendre</h1>
          <p className="text-sm text-muted-foreground">
            {shows.length} séries suivies
          </p>
        </div>
        <div className="inline-flex overflow-hidden rounded-full border border-border">
          <SortOption
            active={sort === "activity"}
            onClick={() => setSort("activity")}
          >
            Dernière activité
          </SortOption>
          <SortOption
            active={sort === "status"}
            onClick={() => setSort("status")}
          >
            Statut
          </SortOption>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sorted.map((show) => (
          <ShowRow key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}

function SortOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-3 py-1.5 text-[13px] transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function ShowRow({ show }: { show: DashboardShow }) {
  const percent =
    show.totalEpisodes > 0
      ? (show.watchedEpisodes / show.totalEpisodes) * 100
      : 0;
  const [isPending, startTransition] = useTransition();
  const posterUrl = tmdbImageUrl(show.posterPath, "w185");

  return (
    <Link
      href={`/shows/${show.id}`}
      className="flex items-stretch gap-4 rounded-2xl bg-card p-3 shadow-elev-sm transition-colors hover:bg-card/80"
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          width={96}
          height={144}
          className="h-36 w-24 flex-none rounded-xl object-cover"
        />
      ) : (
        <PosterPlaceholder className="h-36 w-24" />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-[19px]">{show.title}</h3>
          <span className="text-sm text-muted-foreground">{show.year}</span>
          <StatusBadge status={show.status} />
        </div>
        <div className="flex items-center gap-1.5">
          {show.genres.map((genre) => (
            <GenreTag key={genre}>{genre}</GenreTag>
          ))}
        </div>
        <div>
          <div className="mb-1.5 text-sm">
            Saison {show.seasonNumber} · Épisode {show.episodeOrdinal}/
            {show.episodeTotal}
          </div>
          <ProgressBar
            percent={percent}
            colorClassName={PROGRESS_COLOR[show.status]}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {show.activityLabel}
        </span>
      </div>
      <div className="flex items-center">
        {show.status !== "COMPLETED" && (
          <Button
            className="rounded-full whitespace-nowrap"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startTransition(() => {
                markNextEpisodeWatchedAction(show.id);
              });
            }}
          >
            <Play className="size-3.5" />
            {isPending ? "…" : "Épisode suivant vu"}
          </Button>
        )}
      </div>
    </Link>
  );
}

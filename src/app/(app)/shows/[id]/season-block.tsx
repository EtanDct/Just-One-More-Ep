"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toggleEpisodeAction, toggleSeasonAction } from "./actions";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";
import { cn } from "@/lib/utils";

interface EpisodeItem {
  id: string;
  number: number;
  watched: boolean;
}

export function SeasonBlock({
  showId,
  seasonNumber,
  episodes,
}: {
  showId: string;
  seasonNumber: number;
  episodes: EpisodeItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const watchedCount = episodes.filter((e) => e.watched).length;
  const allWatched = episodes.length > 0 && watchedCount === episodes.length;
  const percent = episodes.length > 0 ? (watchedCount / episodes.length) * 100 : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <h3 className="m-0">Saison {seasonNumber}</h3>
          <span className="text-sm text-muted-foreground">
            {watchedCount}/{episodes.length} épisodes
          </span>
        </div>
        <Button
          variant="secondary"
          className="rounded-full"
          disabled={isPending}
          onClick={() =>
            startTransition(() => toggleSeasonAction(showId, seasonNumber, !allWatched))
          }
        >
          {allWatched ? "Tout décocher" : "Tout marquer vu"}
        </Button>
      </div>
      <ProgressBar percent={percent} colorClassName="bg-brand" />
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2.5">
        {episodes.map((ep) => (
          <button
            key={ep.id}
            type="button"
            disabled={isPending}
            aria-label={`Marquer l'épisode ${ep.number}`}
            onClick={() =>
              startTransition(() => toggleEpisodeAction(ep.id, !ep.watched))
            }
            className={cn(
              "flex aspect-square items-center justify-center rounded-full font-heading text-sm",
              ep.watched
                ? "bg-brand text-primary-foreground"
                : "border-[1.5px] border-neutral-600 text-neutral-300",
            )}
          >
            {ep.watched ? <Check className="size-4" /> : ep.number}
          </button>
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";
import { Check } from "lucide-react";
import type { TMDBShowSummary } from "@/lib/tmdb";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { addShowAction } from "./actions";
import { PosterPlaceholder } from "@/components/poster-placeholder";
import { Button } from "@/components/ui/button";

export function SearchResults({
  results,
  addedTmdbIds,
}: {
  results: TMDBShowSummary[];
  addedTmdbIds: Set<number>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => {
        const posterUrl = tmdbImageUrl(result.posterPath, "w185");
        const year = result.firstAirDate
          ? new Date(result.firstAirDate).getFullYear()
          : null;
        const alreadyAdded = addedTmdbIds.has(result.id);

        return (
          <div
            key={result.id}
            className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-elev-sm"
          >
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt=""
                width={64}
                height={96}
                className="h-24 w-16 flex-none rounded-lg object-cover"
              />
            ) : (
              <PosterPlaceholder className="h-24 w-16" />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="m-0 mb-0.5 truncate">{result.name}</h3>
              {year && (
                <span className="text-sm text-muted-foreground">{year}</span>
              )}
            </div>
            {alreadyAdded ? (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                <Check className="size-4" />
                Déjà dans ma liste
              </span>
            ) : (
              <form action={addShowAction.bind(null, result.id)}>
                <Button type="submit" className="rounded-full whitespace-nowrap">
                  Ajouter à ma liste
                </Button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}

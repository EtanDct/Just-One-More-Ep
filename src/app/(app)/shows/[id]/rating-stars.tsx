"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { setRatingAction } from "./actions";
import { cn } from "@/lib/utils";

export function RatingStars({
  showId,
  rating,
}: {
  showId: string;
  rating: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mb-6 flex items-center gap-1">
      <span className="mr-1.5 text-sm text-muted-foreground">Ma note</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={isPending}
          aria-label="Noter"
          onClick={() => startTransition(() => setRatingAction(showId, n))}
          className="p-0.5"
        >
          <Star
            size={22}
            className={cn(
              n <= rating ? "fill-brand-300 text-brand-300" : "text-neutral-600",
            )}
          />
        </button>
      ))}
    </div>
  );
}

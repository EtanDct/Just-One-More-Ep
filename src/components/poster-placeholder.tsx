import { Tv } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stand-in for a TMDB poster (`tmdbImageUrl` + next/image) once shows are
 * backed by real data instead of the Dashboard mock.
 */
export function PosterPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-none items-center justify-center rounded-xl bg-secondary text-secondary-foreground/40",
        className,
      )}
    >
      <Tv className="size-6" />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUpcomingSeasons } from "@/lib/upcoming";
import { tmdbImageUrl } from "@/lib/tmdb-image";
import { PosterPlaceholder } from "@/components/poster-placeholder";

export const metadata: Metadata = {
  title: "À venir — just one more ep.",
};

export default async function UpcomingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const upcoming = await getUpcomingSeasons(session.user.id);

  return (
    <div>
      <h1 className="mb-1">À venir</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Prochaines sorties de vos séries suivies
      </p>

      {upcoming.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune sortie annoncée pour l&apos;instant.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((u) => {
            const posterUrl = tmdbImageUrl(u.posterPath, "w185");
            return (
              <Link
                key={`${u.showId}-${u.seasonNumber}`}
                href={`/shows/${u.showId}`}
                className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-elev-sm transition-colors hover:bg-card/80"
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
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-brand2-100 px-2.5 py-0.5 text-[11px] text-brand2-800">
                      {u.dateLabel}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {u.countdownLabel}
                    </span>
                  </div>
                  <h3 className="m-0 mb-0.5 truncate">{u.showTitle}</h3>
                  <span className="text-sm text-muted-foreground">
                    Saison {u.seasonNumber}
                    {u.seasonName && !/^saison\s*\d+$/i.test(u.seasonName)
                      ? ` · ${u.seasonName}`
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

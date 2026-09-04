import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { searchShows } from "@/lib/tmdb";
import { Input } from "@/components/ui/input";
import { SearchResults } from "./search-results";

export const metadata: Metadata = {
  title: "Ajouter une série — just one more ep.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchShows(query) : [];

  const tmdbIds = results.map((r) => r.id);
  const followedShows =
    tmdbIds.length > 0
      ? await prisma.show.findMany({
          where: { tmdbId: { in: tmdbIds } },
          select: {
            tmdbId: true,
            followedBy: {
              where: { userId: session.user.id },
              select: { id: true },
            },
          },
        })
      : [];
  const addedTmdbIds = new Set(
    followedShows.filter((s) => s.followedBy.length > 0).map((s) => s.tmdbId),
  );

  return (
    <div>
      <h1 className="mb-1">Ajouter une série</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Cherchez une série et ajoutez-la à votre suivi
      </p>

      <form action="/search" className="mb-6 max-w-md">
        <Input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Rechercher une série…"
          className="rounded-full"
        />
      </form>

      {query && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucun résultat pour « {query} ».
        </p>
      )}

      <SearchResults results={results} addedTmdbIds={addedTmdbIds} />
    </div>
  );
}

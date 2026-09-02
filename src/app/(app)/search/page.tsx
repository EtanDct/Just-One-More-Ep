import type { Metadata } from "next";
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
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchShows(query) : [];

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

      <SearchResults results={results} />
    </div>
  );
}

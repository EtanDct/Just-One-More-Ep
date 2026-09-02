import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardShows } from "@/lib/dashboard";
import { DashboardShows } from "./dashboard-shows";

export const metadata: Metadata = {
  title: "Reprendre — just one more ep.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shows = await getDashboardShows(session.user.id);

  if (shows.length === 0) {
    return (
      <div>
        <h1 className="mb-1">Reprendre</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Aucune série suivie pour l&apos;instant.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Chercher une série
        </Link>
      </div>
    );
  }

  return <DashboardShows shows={shows} />;
}

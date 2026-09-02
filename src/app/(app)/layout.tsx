import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Belt and suspenders: proxy.ts already redirects unauthenticated visitors
  // for this path, but Server Components should never trust that alone.
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AppNav user={session.user} />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

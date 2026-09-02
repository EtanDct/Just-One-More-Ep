"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LINKS = [
  { href: "/dashboard", label: "Séries" },
  { href: "/upcoming", label: "À venir" },
];

export function AppNav({
  user,
}: {
  user: { name?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const initial = user.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3">
        <Link
          href="/dashboard"
          className="mr-auto flex items-center gap-2 font-heading text-lg"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          just one more ep<span className="text-primary">.</span>
        </Link>

        {LINKS.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/dashboard" && pathname.startsWith("/shows"));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm text-foreground transition-colors hover:text-primary",
                active && "text-primary",
              )}
            >
              {link.label}
            </Link>
          );
        })}

        <Link
          href="/search"
          className={cn(
            "flex items-center gap-1 text-sm text-foreground transition-colors hover:text-primary",
            pathname === "/search" && "text-primary",
          )}
        >
          <Search className="size-[15px]" />
          Ajouter
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none ring-ring focus-visible:ring-2">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut({ redirectTo: "/login" })}>
              <LogOut className="size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

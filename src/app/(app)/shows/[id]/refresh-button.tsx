"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { refreshShowAction } from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RefreshButton({ showId }: { showId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-sm"
      disabled={isPending}
      onClick={() => startTransition(() => refreshShowAction(showId))}
    >
      <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
      {isPending ? "Actualisation…" : "Actualiser"}
    </Button>
  );
}

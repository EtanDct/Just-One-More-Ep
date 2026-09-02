import type { ShowStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  ShowStatus,
  { label: string; className: string }
> = {
  WATCHING: {
    label: "En cours",
    className: "bg-brand-100 text-brand-800",
  },
  PAUSED: {
    label: "En pause",
    className: "bg-brand2-100 text-brand2-800",
  },
  COMPLETED: {
    label: "Terminé",
    className: "bg-neutral-100 text-neutral-800",
  },
};

export function StatusBadge({ status }: { status: ShowStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] tracking-wide",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function GenreTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-brand px-2.5 py-0.5 text-[11px] text-brand">
      {children}
    </span>
  );
}

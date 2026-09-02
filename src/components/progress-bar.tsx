import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  colorClassName = "bg-brand",
}: {
  percent: number;
  colorClassName?: string;
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-700">
      <div
        className={cn("h-full rounded-full", colorClassName)}
        style={{ width: `${Math.round(percent)}%` }}
      />
    </div>
  );
}

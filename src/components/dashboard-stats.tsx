import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type DashboardStat = {
  name: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

// Dashboard stat grid in the @blocks-so/stats-01 pattern:
// single bordered grid with gap-px dividers, flat Cards inside,
// name row + big value + description + link. Values are passed
// in as props so dashboard / reports stay live from Appwrite.
export default function DashboardStats({
  stats,
}: {
  stats: DashboardStat[];
}) {
  return (
    <div className="mx-auto grid w-full grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
      {stats.map((stat) => (
        <Card
          className="rounded-none border-0 py-0 shadow-none"
          key={stat.name}
        >
          <CardContent className="flex flex-col gap-2 p-4 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <stat.icon
                className="size-4 text-amber-500"
                aria-hidden="true"
              />
              {stat.name}
            </div>
            <div className="w-full flex-none text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </div>
            <p className="text-sm text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

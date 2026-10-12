import { BadgeCheck, Package, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const rows = [
  {
    icon: BadgeCheck,
    tag: "Sivakasi Direct",
    title: "Genuine Quality",
    description: "Handpicked crackers sourced directly from Sivakasi makers.",
  },
  {
    icon: Package,
    tag: "Family to Wholesale",
    title: "Retail & Bulk",
    description: "From single family packs to full wholesale orders.",
  },
  {
    icon: ShieldCheck,
    tag: "Quality Checked",
    title: "Safe & Certified",
    description: "Quality-checked products with clear safety instructions.",
  },
];

export default function HighlightsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="h-9 pl-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Highlight
            </TableHead>
            <TableHead className="h-9 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              What you get
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.title}
              className="border-b border-border transition-colors duration-100 last:border-b-0 hover:bg-muted/30"
            >
              <TableCell className="py-4 pl-4 align-top">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <row.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{row.title}</p>
                    <Badge variant="secondary" className="mt-1 text-[11px]">
                      {row.tag}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 align-top text-sm text-muted-foreground">
                {row.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

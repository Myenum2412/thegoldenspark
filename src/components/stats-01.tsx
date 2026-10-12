import { BadgeCheck, Package, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const data = [
  {
    icon: BadgeCheck,
    name: 'Sivakasi Direct',
    value: 'Genuine Quality',
    description: 'Handpicked crackers sourced directly from Sivakasi makers.',
  },
  {
    icon: Package,
    name: 'Family to Wholesale',
    value: 'Retail & Bulk',
    description: 'From single family packs to full wholesale orders.',
  },
  {
    icon: ShieldCheck,
    name: 'Quality Checked',
    value: 'Safe & Certified',
    description: 'Quality-checked products with clear safety instructions.',
  },
];

export default function Stats01() {
  return (
    <div className="flex items-center justify-center">
      <div className="mx-auto grid w-full grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        {data.map((stat) => (
          <Card
            className="rounded-none border-0 py-0 shadow-none"
            key={stat.value}
          >
            <CardContent className="flex flex-col gap-2 p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <stat.icon
                  className="size-4 text-amber-500"
                  aria-hidden="true"
                />
                {stat.name}
              </div>
              <div
                className={cn(
                  'w-full flex-none text-2xl font-semibold tracking-tight text-foreground'
                )}
              >
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

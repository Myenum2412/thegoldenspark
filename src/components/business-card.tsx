import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Phone } from "lucide-react";

type BusinessCardProps = {
  name: string;
  address: string;
  pincode: string;
  phone: string;
};

export function BusinessCard({
  name,
  address,
  pincode,
  phone,
}: BusinessCardProps) {
  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4">
        <Image
          src="/logo.png"
          alt={`${name} logo`}
          width={64}
          height={64}
          className="size-16 shrink-0 rounded-lg object-contain"
          priority
        />
        <div className="min-w-0">
          <CardTitle className="google-sans truncate text-xl">
            {name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {address}
            <span className="mt-1 block font-medium text-foreground">
              Pincode: {pincode}
            </span>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="font-medium hover:underline">
            {phone}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

import Image from "next/image";
import { MapPin, Phone, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import CustomerForm from "@/components/customer-form";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      {/* Company details — full width card */}
      <Card className="w-full overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent">
          <CardHeader className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Image
              src="/logo.png"
              alt="Golden Spark logo"
              width={90}
              height={90}
              className="h-20 w-20 shrink-0 rounded-xl border border-border bg-black object-cover"
              priority
            />
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
                <Sparkles className="size-6 text-amber-500" aria-hidden="true" />
                Golden Spark Pvt Ltd
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Every Spark has a Story — premium fireworks from Sivakasi.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
              <MapPin
                className="mt-0.5 size-5 shrink-0 text-amber-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold">Our Address</p>
                <address className="mt-1 text-sm leading-relaxed text-muted-foreground not-italic">
                  Golden Spark Pvt Ltd, No. 2, Mullai Nagar First Street,
                  N.R.K.R. Nagar (Near N.R.K.R. Marriage Hall), Sivakasi –
                  626123.
                </address>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
              <Phone
                className="mt-0.5 size-5 shrink-0 text-amber-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold">Call Us</p>
                <a
                  href="tel:+919962970062"
                  className="mt-1 block text-sm text-muted-foreground hover:text-foreground"
                >
                  +91 99629 70062
                </a>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Customer form */}
      <div className="mx-auto mt-8 w-full max-w-2xl">
        <CustomerForm />
      </div>
      <Toaster />
    </main>
  );
}

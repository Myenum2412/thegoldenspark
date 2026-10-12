"use client";

import * as React from "react";
import { ArrowRight, ClipboardList, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import { createClient } from "@/utils/supabase/client";

const PHONE_DISPLAY = "+91 99629 70062";
const PHONE_TEL = "tel:+919962970062";
const WHATSAPP = "https://wa.me/919962970062";

export default function CustomerForm() {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [pincode, setPincode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Invalid pincode", {
        description: "Pincode must be exactly 6 digits.",
      });
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Invalid phone number", {
        description: "Phone number must be exactly 10 digits.",
      });
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("customers").insert({
      name: name.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
    });
    setSaving(false);

    if (error) {
      toast.error("Could not save details", { description: error.message });
      return;
    }

    toast.success("Details saved", {
      description: `Thanks ${name.trim()}! We will contact you soon.`,
    });
    setName("");
    setAddress("");
    setPincode("");
    setPhone("");
  }

  return (
    <Card className="grid overflow-hidden p-0 sm:grid-cols-5">
      {/* Left info panel */}
      <div className="relative overflow-hidden bg-neutral-950 p-6 text-white sm:col-span-2 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(245,158,11,0.3),transparent)]"
        />
        <div className="relative">
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
          <h2 className="google-sans mt-4 text-2xl font-bold tracking-tight">
            Customer Details
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">
            Share your details and we will get back to you about your order —
            retail, bulk or wholesale.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <a
              href={PHONE_TEL}
              className="flex items-center gap-2 text-neutral-300 hover:text-amber-300"
            >
              <Phone className="size-4" aria-hidden="true" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-300 hover:text-amber-300"
            >
              <WhatsappIcon className="size-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <form
        onSubmit={handleSubmit}
        className="grid content-start gap-4 p-6 sm:col-span-3 sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="customer-name">Name</FieldLabel>
            <Input
              id="customer-name"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="customer-address">Address</FieldLabel>
            <Textarea
              id="customer-address"
              placeholder="Door no, street, area, city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              maxLength={500}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-pincode">Pincode</FieldLabel>
            <Input
              id="customer-pincode"
              inputMode="numeric"
              placeholder="626123"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-phone">Phone number</FieldLabel>
            <Input
              id="customer-phone"
              inputMode="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              required
            />
          </Field>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={saving}
          className="w-full bg-amber-500 text-black hover:bg-amber-400 sm:w-auto sm:justify-self-end"
        >
          {saving ? "Saving…" : "Submit details"}
          <ArrowRight aria-hidden="true" />
        </Button>
      </form>
    </Card>
  );
}

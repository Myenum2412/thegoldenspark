"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Customer Details</CardTitle>
        <CardDescription>
          Share your details and we will get back to you about your order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field>
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
          <Field>
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving…" : "Submit details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

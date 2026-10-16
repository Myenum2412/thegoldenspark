"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import {
  createCustomer,
  createOrder,
  createOrderItems,
} from "@/lib/store";
import type { Product } from "@/lib/store-data";

const WHATSAPP = "https://wa.me/919087606352";

export type OrderLine = { product: Product; qty: number };

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

// Order form rules: everything required, phone = 10-digit Indian
// mobile, pincode = 6 digits, cart must not be empty.
export function validateOrder(input: {
  name: string;
  phone: string;
  address: string;
  pincode: string;
  lines: OrderLine[];
}) {
  const errors: Record<string, string> = {};
  if (input.name.trim().length < 3) {
    errors.name = "Enter your full name (min 3 letters).";
  }
  const phone = normalizePhone(input.phone);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  if (input.address.trim().length < 10) {
    errors.address = "Enter your full address (min 10 characters).";
  }
  if (!/^\d{6}$/.test(input.pincode.trim())) {
    errors.pincode = "Pincode must be 6 digits.";
  }
  if (input.lines.length === 0) {
    errors.cart = "Your cart is empty — add at least one product.";
  }
  return { errors, phone };
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  lines,
  total,
  initialCustomer,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: OrderLine[];
  total: number;
  initialCustomer: { name: string; phone: string; address: string; pincode: string };
  onSaved: () => void;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initialCustomer.name);
  const [phone, setPhone] = React.useState(initialCustomer.phone);
  const [address, setAddress] = React.useState(initialCustomer.address);
  const [pincode, setPincode] = React.useState(initialCustomer.pincode);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  // Prefill from the details form above the pricelist each time it opens.
  React.useEffect(() => {
    if (open) {
      setName(initialCustomer.name);
      setPhone(initialCustomer.phone);
      setAddress(initialCustomer.address);
      setPincode(initialCustomer.pincode);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  // Saves customer + order + items. Returns the order id, or null
  // when only the customer details could be saved.
  async function persistOrder(cleanPhone: string) {
    let customerId: string;
    try {
      const customer = await createCustomer({
        name: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        pincode: pincode.trim(),
      });
      customerId = customer.id;
    } catch (err) {
      toast.error("Could not save details", {
        description: err instanceof Error ? err.message : "Save failed.",
      });
      return null;
    }

    let orderId: string;
    try {
      const order = await createOrder({
        customer_id: customerId,
        customer_name: name.trim(),
        phone: cleanPhone,
        total,
      });
      orderId = order.id;
    } catch (err) {
      toast.error("Could not save order", {
        description:
          err instanceof Error ? err.message : "Order save failed.",
      });
      router.refresh();
      return null;
    }

    try {
      await createOrderItems(
        lines.map((l) => ({
          order_id: orderId,
          product_id: String(l.product.id),
          item_no: l.product.item_no,
          name: l.product.name,
          qty: l.qty,
          rate: Number(l.product.special_rate),
          amount: Number(l.product.special_rate) * l.qty,
        }))
      );
    } catch (err) {
      toast.error("Order saved, items failed", {
        description: err instanceof Error ? err.message : "Items save failed.",
      });
      return null;
    }

    return orderId;
  }

  // Single common action: validate → save to Appwrite → open
  // WhatsApp with the saved order automatically.
  async function handlePlaceOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { errors: errs, phone: cleanPhone } = validateOrder({
      name,
      phone,
      address,
      pincode,
      lines,
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    const orderId = await persistOrder(cleanPhone);
    setSaving(false);
    if (orderId == null) return;

    const orderLines = lines.map(
      (l) =>
        `${l.qty} x ${l.product.name} - ₹${(
          Number(l.product.special_rate) * l.qty
        ).toLocaleString("en-IN")}`
    );
    const text = [
      `Vanakkam Golden Spark! New order #${orderId}:`,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${cleanPhone}`,
      `Address: ${address.trim()}, ${pincode.trim()}`,
      "",
      ...orderLines,
      "",
      `Total: ₹${total.toLocaleString("en-IN")}`,
    ].join("\n");

    // Try automatic send via the wa-sender service; fall back to
    // opening WhatsApp manually when it is offline/unconfigured.
    let autoSent = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 35000);
      const sendRes = await fetch("/api/wa-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const body = (await sendRes.json()) as { sent?: boolean };
      autoSent = body.sent === true;
    } catch {
      autoSent = false;
    }

    if (autoSent) {
      toast.success(`Order #${orderId} saved & WhatsApp sent automatically!`);
    } else {
      window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
      toast.success(`Order #${orderId} saved!`, {
        description: "WhatsApp opened — press send to confirm.",
      });
    }
    onOpenChange(false);
    onSaved();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Details</DialogTitle>
          <DialogDescription>
            Fill your details below — your selected products are saved along
            with this order.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePlaceOrder} className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="order-name">Full Name *</FieldLabel>
            <Input
              id="order-name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="order-phone">Mobile Number *</FieldLabel>
              <Input
                id="order-phone"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^0-9+ ]/g, ""))
                }
                maxLength={14}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="order-pincode">Pincode *</FieldLabel>
              <Input
                id="order-pincode"
                inputMode="numeric"
                placeholder="e.g. 636005"
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
              />
              {errors.pincode && (
                <p className="text-xs text-destructive">{errors.pincode}</p>
              )}
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="order-address">Full Address *</FieldLabel>
            <Textarea
              id="order-address"
              placeholder="Door no, street, area, city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={300}
              rows={2}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address}</p>
            )}
          </Field>

          <div className="rounded-lg border">
            <p className="border-b px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Selected Products ({lines.length})
            </p>
            <ul className="max-h-40 divide-y overflow-y-auto">
              {lines.map((l) => (
                <li
                  key={l.product.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium tabular-nums">
                      {l.qty} ×{" "}
                    </span>
                    <span className="truncate">{l.product.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    ₹
                    {(
                      Number(l.product.special_rate) * l.qty
                    ).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex items-center justify-between border-t bg-muted/40 px-3 py-2 text-sm font-bold">
              <span>Total Amount</span>
              <span className="tabular-nums">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
          {errors.cart && (
            <p className="text-xs text-destructive">{errors.cart}</p>
          )}

          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              <WhatsappIcon className="size-4" aria-hidden="true" />
              {saving
                ? "Placing…"
                : `Place Order · ₹${total.toLocaleString("en-IN")}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

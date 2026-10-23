"use client";

import * as React from "react";
import { SendIcon } from "lucide-react";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BillWhatsAppShareProps = {
  phone: string;
  customerName: string;
  invoiceNo: string;
  total: number;
  shopName: string;
  items: { name: string; qty: number; amount: number }[];
};

export default function BillWhatsAppShare({
  phone,
  customerName,
  invoiceNo,
  total,
  shopName,
  items,
}: BillWhatsAppShareProps) {
  const [sending, setSending] = React.useState(false);

  const digits = phone.replace(/\D/g, "");
  const to = digits.startsWith("91") ? digits : `91${digits}`;

  const lines = items.map(
    (it) => `${it.qty} x ${it.name} - ₹${Number(it.amount).toLocaleString("en-IN")}`
  );

  const message = [
    `🧾 *${shopName} — Invoice #${invoiceNo}*`,
    "",
    `Dear ${customerName},`,
    `Thank you for your order! Here is your bill:`,
    "",
    ...lines,
    "",
    `*Total: ₹${Number(total).toLocaleString("en-IN")}*`,
    "",
    "Please confirm receipt or contact us for any queries.",
    "",
    "Thank you, Visit again!!!",
  ].join("\n");

  const handleShare = () => {
    setSending(true);
    const url = `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setTimeout(() => setSending(false), 1000);
    toast.success("WhatsApp opened", {
      description: "Press send to share the bill with the customer.",
    });
  };

  return (
    <Button
      onClick={handleShare}
      disabled={sending}
      className="bg-green-600 text-white hover:bg-green-500 flex items-center gap-2"
    >
      {sending ? (
        <SendIcon className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <WhatsappIcon className="size-4" aria-hidden="true" />
      )}
      {sending ? "Sharing…" : "Share via WhatsApp"}
    </Button>
  );
}

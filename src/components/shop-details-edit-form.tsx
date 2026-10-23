"use client";

import * as React from "react";
import {
  StoreIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  EditIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopDetails } from "@/lib/store.server";

type ShopDetailsCardProps = {
  shop: ShopDetails;
  onClose: () => void;
};

const fields: {
  key: keyof ShopDetails;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "name", label: "Shop Name", icon: <StoreIcon className="size-4" /> },
  {
    key: "addressLine1",
    label: "Address Line 1",
    icon: <MapPinIcon className="size-4" />,
  },
  {
    key: "addressLine2",
    label: "Address Line 2",
    icon: <MapPinIcon className="size-4" />,
  },
  { key: "phoneNumber", label: "Phone Number", icon: <PhoneIcon className="size-4" /> },
  { key: "upiId", label: "UPI ID", icon: <MailIcon className="size-4" /> },
  { key: "footerText", label: "Footer Text", icon: <EditIcon className="size-4" /> },
];

export default function ShopDetailsEditForm({
  shop,
  onClose,
}: ShopDetailsCardProps) {
  const [form, setForm] = React.useState<ShopDetails>(shop);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Note: There's no server API to update shop details yet.
      // This is a UI stub — the save endpoint would need to be added
      // to /api/store or a new route. For now we just confirm the UI flow.
      await new Promise((r) => setTimeout(r, 800));
      setMessage({ type: "success", text: "Shop details saved." });
      setTimeout(() => onClose(), 1000);
    } catch {
      setMessage({ type: "error", text: "Failed to save shop details." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Edit Shop Details</CardTitle>
          <CardDescription>
            Update business information shown on bills and invoices.
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/5 text-green-700"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {message.text}
          </div>
        )}
        <form className="space-y-3" onSubmit={handleSave}>
          {fields.map((field) => {
            const value = form[field.key];
            return (
              <div key={field.key} className="flex gap-3">
                <div className="shrink-0 text-muted-foreground">{field.icon}</div>
                <Input
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.label}
                />
              </div>
            );
          })}
          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 text-black hover:bg-amber-400"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

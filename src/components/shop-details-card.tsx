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
import type { ShopDetails } from "@/lib/store.server";
import ShopDetailsEditForm from "./shop-details-edit-form";

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

type ShopDetailsCardProps = {
  shop: ShopDetails;
  editing: boolean;
  onEditToggle: (editing: boolean) => void;
};

export default function ShopDetailsCard({
  shop,
  editing,
  onEditToggle,
}: ShopDetailsCardProps) {
  if (editing) {
    return <ShopDetailsEditForm shop={shop} onClose={() => onEditToggle(false)} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Shop Details</CardTitle>
          <CardDescription>
            Business information shown on bills and invoices.
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => onEditToggle(true)}>
          <EditIcon className="size-3.5 mr-1" aria-hidden="true" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="flex items-start gap-3">
              <div className="shrink-0 mt-1 text-muted-foreground">
                {field.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  {field.label}
                </p>
                <p className="text-sm">{shop[field.key] || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

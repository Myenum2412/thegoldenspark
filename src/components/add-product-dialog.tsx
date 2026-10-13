"use client";

import * as React from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddProductForm from "@/components/add-product-form";

export default function AddProductDialog({
  onChanged,
}: {
  onChanged?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-amber-500 text-black hover:bg-amber-400">
            <PlusIcon className="size-4" aria-hidden="true" />
            Add Product
          </Button>
        }
      />
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Saved directly to Appwrite.</DialogDescription>
        </DialogHeader>
        <AddProductForm
          plain
          onAdded={() => {
            setOpen(false);
            onChanged?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ProductImageField from "@/components/product-image-field";
import { deleteProducts, updateProduct } from "@/lib/store";
import { productImageSrc, type Product } from "@/lib/store-data";
import Image from "next/image";

export default function ProductActions({
  product,
  onChanged,
}: {
  product: Product;
  onChanged?: () => void;
}) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const [name, setName] = React.useState(product.name);
  const [category, setCategory] = React.useState(product.category);
  const [packing, setPacking] = React.useState(product.packing);
  const [mrp, setMrp] = React.useState(String(product.mrp));
  const [rate, setRate] = React.useState(String(product.special_rate));
  const [stock, setStock] = React.useState(String(product.stock ?? 0));
  const [image, setImage] = React.useState(product.image ?? "");

  function resetForm() {
    setName(product.name);
    setCategory(product.category);
    setPacking(product.packing);
    setMrp(String(product.mrp));
    setRate(String(product.special_rate));
    setStock(String(product.stock ?? 0));
    setImage(product.image ?? "");
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProduct(String(product.id), {
        name: name.trim(),
        category: category.trim() || "General",
        packing: packing.trim() || "Box",
        mrp: Number(mrp) || 0,
        special_rate: Number(rate) || 0,
        stock: Number(stock) || 0,
        image: image.trim(),
      });
    } catch (err) {
      setSaving(false);
      toast.error("Could not update product", {
        description: err instanceof Error ? err.message : "Update failed.",
      });
      return;
    }
    setSaving(false);

    toast.success("Product updated");
    setEditOpen(false);
    onChanged?.();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProducts([String(product.id)]);
    } catch (err) {
      setDeleting(false);
      toast.error("Could not delete product", {
        description: err instanceof Error ? err.message : "Delete failed.",
      });
      return;
    }
    setDeleting(false);

    toast.success("Product deleted");
    onChanged?.();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`View ${product.name}`}
            >
              <EyeIcon className="size-4" aria-hidden="true" />
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Product #{product.item_no}</DialogTitle>
            <DialogDescription>{product.name}</DialogDescription>
          </DialogHeader>
          {productImageSrc(product.image) && (
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-muted/40">
              <Image
                src={productImageSrc(product.image)!}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-contain p-2"
              />
            </div>
          )}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{product.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Packing</dt>
              <dd className="font-medium">{product.packing}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">2026 MRP (₹)</dt>
              <dd className="font-medium tabular-nums">
                {Number(product.mrp).toLocaleString("en-IN")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Our Special Rate (₹)</dt>
              <dd className="font-medium tabular-nums text-amber-600">
                {Number(product.special_rate).toLocaleString("en-IN")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stock</dt>
              <dd className="font-medium tabular-nums">
                {Number(product.stock ?? 0).toLocaleString("en-IN")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stock Value (₹)</dt>
              <dd className="font-medium tabular-nums">
                {(
                  Number(product.special_rate) * Number(product.stock ?? 0)
                ).toLocaleString("en-IN")}
              </dd>
            </div>
          </dl>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline">Close</Button>}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (open) resetForm();
        }}
      >
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${product.name}`}
            >
              <PencilIcon className="size-4" aria-hidden="true" />
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit #{product.item_no}</DialogTitle>
            <DialogDescription>
              Changes save directly to Appwrite.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`edit-name-${product.id}`}>
                Variety / Description
              </FieldLabel>
              <Input
                id={`edit-name-${product.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-category-${product.id}`}>
                Category
              </FieldLabel>
              <Input
                id={`edit-category-${product.id}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={50}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-packing-${product.id}`}>
                Packing
              </FieldLabel>
              <Input
                id={`edit-packing-${product.id}`}
                value={packing}
                onChange={(e) => setPacking(e.target.value)}
                maxLength={20}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-mrp-${product.id}`}>MRP (₹)</FieldLabel>
              <Input
                id={`edit-mrp-${product.id}`}
                inputMode="decimal"
                value={mrp}
                onChange={(e) =>
                  setMrp(e.target.value.replace(/[^0-9.]/g, ""))
                }
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-rate-${product.id}`}>
                Our Rate (₹)
              </FieldLabel>
              <Input
                id={`edit-rate-${product.id}`}
                inputMode="decimal"
                value={rate}
                onChange={(e) =>
                  setRate(e.target.value.replace(/[^0-9.]/g, ""))
                }
                required
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`edit-stock-${product.id}`}>Stock</FieldLabel>
              <Input
                id={`edit-stock-${product.id}`}
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <div className="sm:col-span-2">
              <ProductImageField
                id={`edit-image-${product.id}`}
                value={image}
                onChange={setImage}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <DialogClose
                render={<Button variant="outline" type="button">Cancel</Button>}
              />
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label={`Delete ${product.name}`}
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete #{product.item_no}?</AlertDialogTitle>
            <AlertDialogDescription>
              “{product.name}” will be removed from the pricelist permanently.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

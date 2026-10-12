"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/utils/supabase/client";

export default function AddProductForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      category: category.trim() || "General",
      price: Number(price) || 0,
      stock: Number(stock) || 0,
    });
    setSaving(false);

    if (error) {
      toast.error("Could not add product", { description: error.message });
      return;
    }

    toast.success("Product added");
    setName("");
    setCategory("");
    setPrice("");
    setStock("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Product</CardTitle>
        <CardDescription>Saved directly to Supabase.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-name">Name</FieldLabel>
            <Input
              id="product-name"
              placeholder="e.g. Flower Pot Big"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-category">Category</FieldLabel>
            <Input
              id="product-category"
              placeholder="e.g. Fancy"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={50}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-price">Price (₹)</FieldLabel>
            <Input
              id="product-price"
              inputMode="decimal"
              placeholder="0"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value.replace(/[^0-9.]/g, ""))
              }
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
            <Input
              id="product-stock"
              inputMode="numeric"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

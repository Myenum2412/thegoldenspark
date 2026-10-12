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
  const [itemNo, setItemNo] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [packing, setPacking] = React.useState("Box");
  const [mrp, setMrp] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").insert({
      item_no: Number(itemNo) || 0,
      name: name.trim(),
      category: category.trim() || "General",
      packing: packing.trim() || "Box",
      mrp: Number(mrp) || 0,
      special_rate: Number(rate) || 0,
    });
    setSaving(false);

    if (error) {
      toast.error("Could not add product", { description: error.message });
      return;
    }

    toast.success("Product added");
    setItemNo("");
    setName("");
    setCategory("");
    setPacking("Box");
    setMrp("");
    setRate("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Product</CardTitle>
        <CardDescription>Saved directly to Supabase.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="product-item">Item No.</FieldLabel>
            <Input
              id="product-item"
              inputMode="numeric"
              placeholder="91"
              value={itemNo}
              onChange={(e) => setItemNo(e.target.value.replace(/\D/g, ""))}
              required
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="product-name">Variety / Description</FieldLabel>
            <Input
              id="product-name"
              placeholder="e.g. R24-FLOWER POTS BIG"
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
              placeholder="e.g. Flower Pots"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={50}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-packing">Packing</FieldLabel>
            <Input
              id="product-packing"
              placeholder="Box"
              value={packing}
              onChange={(e) => setPacking(e.target.value)}
              maxLength={20}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-mrp">MRP (₹)</FieldLabel>
            <Input
              id="product-mrp"
              inputMode="decimal"
              placeholder="0"
              value={mrp}
              onChange={(e) => setMrp(e.target.value.replace(/[^0-9.]/g, ""))}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-rate">Our Rate (₹)</FieldLabel>
            <Input
              id="product-rate"
              inputMode="decimal"
              placeholder="0"
              value={rate}
              onChange={(e) => setRate(e.target.value.replace(/[^0-9.]/g, ""))}
              required
            />
          </Field>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

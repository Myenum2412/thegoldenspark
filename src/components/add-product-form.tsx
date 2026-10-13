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
import { createProduct } from "@/lib/store";

export default function AddProductForm({
  onAdded,
  plain = false,
}: {
  onAdded?: () => void;
  plain?: boolean;
}) {
  const [itemNo, setItemNo] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [packing, setPacking] = React.useState("Box");
  const [mrp, setMrp] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [stock, setStock] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await createProduct({
        item_no: Number(itemNo) || 0,
        name: name.trim(),
        category: category.trim() || "General",
        packing: packing.trim() || "Box",
        mrp: Number(mrp) || 0,
        special_rate: Number(rate) || 0,
        stock: Number(stock) || 0,
      });
    } catch (err) {
      setSaving(false);
      toast.error("Could not add product", {
        description: err instanceof Error ? err.message : "Save failed.",
      });
      return;
    }
    setSaving(false);

    toast.success("Product added");
    setItemNo("");
    setName("");
    setCategory("");
    setPacking("Box");
    setMrp("");
    setRate("");
    setStock("");
    onAdded?.();
  }

  const fields = (
    <AddProductFields
      itemNo={itemNo}
      setItemNo={setItemNo}
      name={name}
      setName={setName}
      category={category}
      setCategory={setCategory}
      packing={packing}
      setPacking={setPacking}
      mrp={mrp}
      setMrp={setMrp}
      rate={rate}
      setRate={setRate}
      stock={stock}
      setStock={setStock}
      saving={saving}
      onSubmit={handleSubmit}
      cols={plain ? "sm:grid-cols-2" : "sm:grid-cols-3"}
      btnClass={plain ? "sm:col-span-2" : "sm:col-span-3"}
    />
  );

  if (plain) return fields;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Product</CardTitle>
        <CardDescription>Saved directly to Appwrite.</CardDescription>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}

export function AddProductFields({
  itemNo,
  setItemNo,
  name,
  setName,
  category,
  setCategory,
  packing,
  setPacking,
  mrp,
  setMrp,
  rate,
  setRate,
  stock,
  setStock,
  saving,
  onSubmit,
  cols = "sm:grid-cols-3",
  btnClass = "sm:col-span-3",
}: {
  itemNo: string;
  setItemNo: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  packing: string;
  setPacking: (v: string) => void;
  mrp: string;
  setMrp: (v: string) => void;
  rate: string;
  setRate: (v: string) => void;
  stock: string;
  setStock: (v: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  cols?: string;
  btnClass?: string;
}) {
  return (
<form onSubmit={onSubmit} className={`grid gap-4 ${cols}`}>
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
          <Field>
            <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
            <Input
              id="product-stock"
              inputMode="numeric"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <div className={btnClass}>
            <Button type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add product"}
            </Button>
          </div>
        </form>
  );
}

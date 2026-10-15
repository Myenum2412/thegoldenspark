"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOffIcon } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { listProductImages } from "@/lib/store";
import { productImageSrc } from "@/lib/store-data";

// Image picker for the dashboard: a text input (free-form filename or URL)
// paired with a live preview and a datalist of the files in /public/Diwali.
export default function ProductImageField({
  id,
  value,
  onChange,
  label = "Product Image",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [images, setImages] = React.useState<string[]>([]);

  React.useEffect(() => {
    let live = true;
    listProductImages()
      .then((list) => {
        if (live) setImages(list);
      })
      .catch(() => {
        // non-fatal — the input still accepts free text
      });
    return () => {
      live = false;
    };
  }, []);

  const src = productImageSrc(value);
  const listId = `${id}-datalist`;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
          {src ? (
            <Image
              src={src}
              alt=""
              width={48}
              height={48}
              sizes="48px"
              className="size-full object-cover"
            />
          ) : (
            <ImageOffIcon
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        <Input
          id={id}
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Pick a file from /Diwali or paste a URL"
        />
        <datalist id={listId}>
          {images.map((img) => (
            <option key={img} value={img} />
          ))}
        </datalist>
      </div>
    </Field>
  );
}

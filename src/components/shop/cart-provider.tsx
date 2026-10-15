"use client";

import * as React from "react";

import { ProductArt } from "@/components/shop/product-art";
import type { CartLine } from "@/components/ecomcn/cart-line-item";
import type { ProductCardProduct } from "@/components/ecomcn/product-card";
import { SHOP_PRODUCTS, type ShopProduct } from "@/lib/shop-data";

/** Maps a catalogue row to the shape the product blocks render. */
export function toCardProduct(product: ShopProduct): ProductCardProduct {
  return {
    id: product.id,
    name: product.name,
    href: `/product/${product.slug}`,
    brand: product.brand,
    price: product.price,
    compareAt: product.compareAt,
    badge: product.badge,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: <ProductArt seed={product.seed} />,
    colors: product.colors.map((color) => ({
      name: color.name,
      hex: color.hex,
      image: <ProductArt seed={product.seed} tone={color.hex} />,
    })),
  };
}

export const CARD_PRODUCTS: ProductCardProduct[] = SHOP_PRODUCTS.map(toCardProduct);

const BY_ID = new Map(SHOP_PRODUCTS.map((p) => [p.id, p]));

interface CartEntry {
  key: string;
  productId: string;
  slug: string;
  name: string;
  brand: string;
  seed: number;
  colorName: string;
  colorHex: string;
  unitPrice: number;
  compareAt?: number;
  quantity: number;
}

export interface CartContextValue {
  entries: CartEntry[];
  /** The same lines the bag sheet renders — thumbnails included. */
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** Add one of `product`; `colorIndex` picks the swatch's colour. */
  add: (product: ProductCardProduct, colorIndex?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used within <CartProvider>.");
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<CartEntry[]>([]);

  const add = React.useCallback<CartContextValue["add"]>((product, colorIndex = 0) => {
    const source = BY_ID.get(product.id);
    const color = product.colors?.[colorIndex];
    const colorName = color?.name ?? "Standard";
    const colorHex = color?.hex ?? "#f59e0b";
    const key = `${product.id}:${colorName}`;

    setEntries((current) => {
      const existing = current.find((entry) => entry.key === key);
      if (existing) {
        return current.map((entry) =>
          entry.key === key ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }
      return [
        ...current,
        {
          key,
          productId: product.id,
          slug: source?.slug ?? product.id,
          name: product.name,
          brand: product.brand ?? "Golden Spark",
          seed: source?.seed ?? 0,
          colorName,
          colorHex,
          unitPrice: product.price,
          compareAt: product.compareAt,
          quantity: 1,
        },
      ];
    });
  }, []);

  const setQuantity = React.useCallback<CartContextValue["setQuantity"]>((key, quantity) => {
    const next = Math.max(1, Math.round(quantity) || 1);
    setEntries((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, quantity: next } : entry)),
    );
  }, []);

  const remove = React.useCallback<CartContextValue["remove"]>((key) => {
    setEntries((current) => current.filter((entry) => entry.key !== key));
  }, []);

  const value = React.useMemo<CartContextValue>(() => {
    const lines: CartLine[] = entries.map((entry) => ({
      id: entry.key,
      name: entry.name,
      href: `/product/${entry.slug}`,
      brand: entry.brand,
      variant: entry.colorName,
      image: <ProductArt seed={entry.seed} tone={entry.colorHex} />,
      unitPrice: entry.unitPrice,
      compareAt: entry.compareAt,
      quantity: entry.quantity,
      maxQuantity: 20,
    }));
    const count = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const subtotal = entries.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0);
    return { entries, lines, count, subtotal, add, setQuantity, remove };
  }, [entries, add, setQuantity, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

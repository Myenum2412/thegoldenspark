import type { Metadata } from "next";

import { StorefrontHome } from "@/components/shop/storefront-home";

export const metadata: Metadata = {
  title: "Golden Spark – Premium Sivakasi Fireworks in Salem",
  description:
    "Shop rockets, aerial shots, fancy fountains and family combo boxes at direct factory rates. Free delivery over ₹1,500 across Tamil Nadu. Every Spark has a Story.",
};

export default function Page() {
  return <StorefrontHome />;
}

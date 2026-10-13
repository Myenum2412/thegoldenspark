"use client";

import * as React from "react";
import { client } from "@/lib/appwrite";

// Runs `client.ping()` once when the app starts so the Appwrite
// setup can be confirmed from the browser console / network tab.
export default function AppwritePing() {
  React.useEffect(() => {
    let cancelled = false;
    client
      .ping()
      .then(() => {
        if (!cancelled) console.log("[appwrite] ping ok");
      })
      .catch((err) => {
        if (!cancelled) console.error("[appwrite] ping failed", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

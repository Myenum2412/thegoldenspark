"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

export default function WaStatus() {
  const [state, setState] = React.useState<
    | { loading: true }
    | { loading?: false; configured: boolean; reachable: boolean; ready: boolean }
  >({ loading: true });

  React.useEffect(() => {
    fetch("/api/wa-status", { cache: "no-store" })
      .then((r) => r.json())
      .then((b) => setState({ ...b, loading: false } as never))
      .catch(() => setState({ configured: false, reachable: false, ready: false }));
  }, []);

  if ("loading" in state && state.loading) {
    return <Badge variant="outline">Checking WhatsApp…</Badge>;
  }
  const s = state as { configured: boolean; reachable: boolean; ready: boolean };
  if (s.ready) {
    return (
      <Badge className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
        WhatsApp auto-send ON
      </Badge>
    );
  }
  const reason = !s.configured
    ? "sender not configured"
    : !s.reachable
      ? "sender offline"
      : "session logged out";
  return <Badge variant="outline">WhatsApp manual mode ({reason})</Badge>;
}

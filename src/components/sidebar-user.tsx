"use client";

import * as React from "react";
import { NavUser } from "@/components/nav-user";
import { account } from "@/lib/appwrite";

// Client component: resolves the logged-in Appwrite user for the
// sidebar footer. Renders a skeleton until the session resolves.
export function SidebarUser() {
  const [email, setEmail] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let live = true;
    account
      .get()
      .then((user) => {
        if (live) setEmail(user.email);
      })
      .catch(() => {
        if (live) setEmail("");
      })
      .finally(() => {
        if (live) setDone(true);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!done) return <SidebarUserFallback />;
  const address = email || "admin";
  return (
    <NavUser
      user={{ name: address.split("@")[0] || "Admin", email: address, avatar: "" }}
    />
  );
}

export function SidebarUserFallback() {
  return (
    <div className="flex items-center gap-2 rounded-lg p-2">
      <div className="size-8 animate-pulse rounded-lg bg-muted" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

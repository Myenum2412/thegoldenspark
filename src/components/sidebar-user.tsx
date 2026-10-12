import { NavUser } from "@/components/nav-user";
import { requireUser } from "@/lib/require-user";

// Async server component: resolves the logged-in user for the sidebar
// footer. Rendered inside <Suspense> so the sidebar chrome can
// prerender/stream instantly without blocking on auth.
export async function SidebarUser() {
  const { user } = await requireUser();
  const email = user.email ?? "";
  return (
    <NavUser
      user={{ name: email.split("@")[0] || "Admin", email, avatar: "" }}
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

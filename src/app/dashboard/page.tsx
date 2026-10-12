import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UsersIcon } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/utils/supabase/server";

type Customer = {
  id: string | number;
  name: string;
  address: string;
  pincode: string;
  phone: string;
  created_at?: string;
};

export default function Page() {
  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Loading dashboard…
          </div>
        }
      >
        <DashboardData />
      </Suspense>
    </SidebarProvider>
  );
}

async function DashboardData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, address, pincode, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const customers = (data ?? []) as Customer[];
  const displayName = user.email?.split("@")[0] ?? "Admin";

  return (
    <>
      <AppSidebar
        user={{ name: displayName, email: user.email ?? "", avatar: "" }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <UsersIcon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-base">Total Customers</CardTitle>
              </CardHeader>
              <CardContent className="-mt-2">
                <p className="text-3xl font-bold tabular-nums">
                  {error ? "—" : customers.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Stored in Supabase
                </p>
              </CardContent>
            </Card>
          </div>

          <Card id="customers">
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                Details submitted from the store website form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="font-semibold">Could not load customers.</p>
                  <p className="mt-1 text-muted-foreground">{error.message}</p>
                  <p className="mt-2 text-muted-foreground">
                    If the <code>customers</code> table doesn&apos;t exist yet,
                    create it in Supabase → SQL Editor:
                  </p>
                  <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs">
                    {`create table customers (
  id bigint generated always as identity primary key,
  name text not null,
  address text not null,
  pincode text not null,
  phone text not null,
  created_at timestamptz default now()
);`}
                  </pre>
                </div>
              ) : customers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No customer submissions yet — new form entries will appear
                  here.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Pincode</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.name}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {c.address}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.pincode}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.phone}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  );
}

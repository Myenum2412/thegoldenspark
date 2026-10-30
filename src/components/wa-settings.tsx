"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  SendIcon,
  SmartphoneIcon,
  TriangleAlertIcon,
  WifiOffIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type WaState = {
  configured: boolean;
  reachable: boolean;
  ready: boolean;
  number: string | null;
};

type QrState = "idle" | "loading" | "pending" | "ready" | "error";

function formatNumber(value: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export default function WaSettings() {
  const [state, setState] = React.useState<WaState | null>(null);
  const [qrState, setQrState] = React.useState<QrState>("idle");
  const [qrSrc, setQrSrc] = React.useState<string | null>(null);
  const [updated, setUpdated] = React.useState<Date | null>(null);
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [testing, setTesting] = React.useState(false);
  const objectUrl = React.useRef<string | null>(null);

  // Poll the sender's status while this page is open.
  React.useEffect(() => {
    let live = true;

    async function check() {
      try {
        const res = await fetch("/api/wa-status", { cache: "no-store" });
        const body = (await res.json()) as Partial<WaState>;
        if (!live) return;
        setState({
          configured: body.configured === true,
          reachable: body.reachable === true,
          ready: body.ready === true,
          number: body.number ?? null,
        });
      } catch {
        if (live)
          setState({
            configured: false,
            reachable: false,
            ready: false,
            number: null,
          });
      }
    }

    void check();
    const id = setInterval(check, 5000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [refreshTick]);

  const configured = state?.configured ?? false;
  const reachable = state?.reachable ?? false;
  const ready = state?.ready ?? false;
  const number = state?.number ?? null;
  const loading = state === null;

  async function sendTest() {
    setTesting(true);
    try {
      const res = await fetch("/api/wa-test", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        targets?: string[];
        results?: Record<string, boolean>;
        error?: string;
      };
      if (res.ok && body.ok) {
        toast.success("Test message sent successfully!", {
          description:
            "Delivered to store numbers (+91 83444 76962, +91 90876 06352) & linked device.",
        });
      } else {
        const reason =
          body.error === "not-linked"
            ? "The sender is not linked yet."
            : body.error === "not-configured"
              ? "Sender not configured."
              : body.error === "unauthorized"
                ? "Session expired. Please log in again."
                : "Could not send the test message.";
        toast.error("Test failed", { description: reason });
      }
    } catch {
      toast.error("Test failed", { description: "Could not reach the sender." });
    } finally {
      setTesting(false);
    }
  }

  // Load and periodically refresh the rotating QR while awaiting a scan.
  React.useEffect(() => {
    if (loading || !configured || !reachable || ready) {
      return;
    }

    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      if (!live) return;
      setQrState((prev) => (prev === "ready" ? prev : "loading"));
      try {
        const res = await fetch(`/api/wa-qr?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!live) return;
        if (res.status === 204) {
          setQrState("pending");
        } else if (res.status === 409) {
          setQrState("idle");
        } else if (!res.ok) {
          setQrState("error");
        } else {
          const blob = await res.blob();
          if (!live) return;
          if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
          objectUrl.current = URL.createObjectURL(blob);
          setQrSrc(objectUrl.current);
          setQrState("ready");
          setUpdated(new Date());
        }
      } catch {
        if (live) setQrState("error");
      } finally {
        if (live) timer = setTimeout(load, 8000);
      }
    }

    void load();
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
      if (objectUrl.current) {
        URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = null;
      }
    };
  }, [loading, configured, reachable, ready, refreshTick]);

  const statusBadge = loading ? (
    <Badge variant="outline">
      <Loader2Icon className="animate-spin" /> Checking…
    </Badge>
  ) : ready ? (
    <Badge className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
      Connected
    </Badge>
  ) : !configured ? (
    <Badge variant="outline">Not configured</Badge>
  ) : !reachable ? (
    <Badge variant="outline">Sender offline</Badge>
  ) : (
    <Badge variant="outline">Waiting for scan</Badge>
  );

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <SmartphoneIcon className="size-5" />
              WhatsApp auto-send
            </CardTitle>
            <CardDescription className="mt-1">
              Link the store phone so checkout confirmation messages are sent
              automatically.
            </CardDescription>
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Checking the sender…
          </p>
        ) : ready ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-green-600" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  WhatsApp is connected
                  {formatNumber(number) ? (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      as {formatNumber(number)}
                    </span>
                  ) : null}
                </p>
                <p className="text-muted-foreground">
                  New checkout orders are sent automatically to the store
                  number. If the sender goes offline, checkout falls back to
                  opening WhatsApp manually — orders are never lost.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={sendTest}
                disabled={testing}
              >
                {testing ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SendIcon />
                )}
                {testing ? "Sending…" : "Send test message"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Sends a test message to both store numbers (+91 83444 76962, +91 90876 06352) and the linked device.
              </span>
            </div>
          </div>
        ) : !configured ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Sender not configured</p>
              <p className="text-muted-foreground">
                Set <code className="rounded bg-muted px-1">WA_SENDER_URL</code>{" "}
                and{" "}
                <code className="rounded bg-muted px-1">WA_SENDER_SECRET</code>{" "}
                in the site environment, then redeploy.
              </p>
            </div>
          </div>
        ) : !reachable ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <WifiOffIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Sender is offline</p>
              <p className="text-muted-foreground">
                The WhatsApp sender service is not reachable. Check that the{" "}
                <code className="rounded bg-muted px-1">gsh-wa-sender</code>{" "}
                process is running on the server.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[260px_1fr] sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-[260px] items-center justify-center rounded-xl border bg-white p-3">
                {qrState === "ready" && qrSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob URL, not a static asset
                  <img
                    src={qrSrc}
                    alt="WhatsApp link QR code"
                    width={232}
                    height={232}
                    className="size-full object-contain"
                  />
                ) : qrState === "error" ? (
                  <p className="text-center text-xs text-muted-foreground">
                    <WifiOffIcon className="mx-auto mb-2 size-6" />
                    Could not load the QR code.
                  </p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    <Loader2Icon className="mx-auto mb-2 size-6 animate-spin" />
                    {qrState === "pending" ? "Starting WhatsApp…" : "Loading QR…"}
                  </p>
                )}
              </div>
              {updated ? (
                <span className="text-xs text-muted-foreground">
                  Refreshes automatically · {updated.toLocaleTimeString()}
                </span>
              ) : null}
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium">Scan with the store phone</p>
              <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                <li>Open WhatsApp on the phone that sends orders.</li>
                <li>
                  Go to <span className="font-medium">Settings → Linked devices → Link a device</span>.
                </li>
                <li>Point the camera at this QR code.</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                The code refreshes every few seconds. Once linked, this page
                switches to Connected automatically.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshTick((t) => t + 1)}
              >
                <RefreshCwIcon /> Refresh now
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

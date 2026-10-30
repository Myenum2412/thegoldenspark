// Golden Spark WhatsApp sender (https://wwebjs.dev).
// Runs whatsapp-web.js with a persistent logged-in session and exposes
// a tiny HTTP API the Next.js site calls to auto-send order confirmations.
//
//   POST /send  { to, message, secret }  ->  { ok: true, id }
//   GET  /status                          ->  { ready: bool, number: string|null }
//   GET  /qr?secret=...                   ->  PNG of the link QR (while unlinked)
//
// Keep this process running 24/7 (pm2 / systemd / Railway / VPS).
// It CANNOT run on Vercel serverless — Chromium + session need a server.

require("dotenv").config();
const express = require("express");
const qrcode = require("qrcode-terminal");
const QRCode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PORT = Number(process.env.PORT || 3101);
const SECRET = process.env.WA_SECRET || "";
// Separate, lower-privilege token for viewing the link QR, so the
// send secret never has to appear in a browser URL.
const QR_TOKEN = process.env.WA_QR_TOKEN || "";
const EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "";

function qrKeyOk(req) {
  if (QR_TOKEN && String(req.query.token || "") === QR_TOKEN) return true;
  return String(req.query.secret || "") === SECRET;
}

if (!SECRET) {
  console.error("Set WA_SECRET env before starting.");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "256kb" }));

let isRestarting = false;
function triggerRestart(reason) {
  if (isRestarting) return;
  isRestarting = true;
  ready = false;
  console.error(`[RESTART] Triggering service restart: ${reason}`);
  setTimeout(() => {
    process.exit(1);
  }, 2000);
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    protocolTimeout: 90000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-default-browser-check",
    ],
    ...(EXECUTABLE_PATH ? { executablePath: EXECUTABLE_PATH } : {}),
  },
});

let ready = false;
let qrDataUrl = null;
let linkedNumber = null;

client.on("qr", async (qr) => {
  ready = false;
  console.log("Scan this QR with the sender phone (WhatsApp → Linked devices):");
  qrcode.generate(qr, { small: true });
  try {
    qrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 });
  } catch {
    qrDataUrl = null;
  }
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated.");
});

client.on("auth_failure", (m) => {
  console.error("Auth failed:", m);
  triggerRestart("auth_failure: " + m);
});

client.on("ready", () => {
  ready = true;
  qrDataUrl = null;
  try {
    linkedNumber = client.info?.wid?.user ?? null;
  } catch {
    linkedNumber = null;
  }
  console.log(`WhatsApp sender ready${linkedNumber ? ` as ${linkedNumber}` : ""}.`);
});

client.on("disconnected", (reason) => {
  ready = false;
  qrDataUrl = null;
  console.log("Disconnected:", reason, "— restarting to reconnect…");
  triggerRestart("disconnected: " + reason);
});

// Diagnostics: confirm messages actually leave the device.
client.on("message_create", (m) => {
  if (m.fromMe) {
    console.log(`outgoing -> ${m.to}: ${String(m.body || "").slice(0, 50)}`);
  }
});
client.on("message_ack", (m, ack) => {
  if (m.fromMe) {
    console.log(`ack ${ack} for "${String(m.body || "").slice(0, 30)}"`);
  }
});

// Send queue to prevent concurrent evaluate collisions in Puppeteer
let sendQueue = Promise.resolve();

function enqueueSend(to, message) {
  return new Promise((resolve, reject) => {
    sendQueue = sendQueue
      .then(async () => {
        try {
          const res = await doSend(to, message);
          // Wait 800ms between sends to avoid flooding WhatsApp Web
          await new Promise((r) => setTimeout(r, 800));
          resolve(res);
        } catch (err) {
          await new Promise((r) => setTimeout(r, 500));
          reject(err);
        }
      })
      .catch((err) => {
        console.error("Queue chain error:", err?.message);
      });
  });
}

async function doSend(to, message) {
  if (!ready || isRestarting || !client.pupPage || client.pupPage.isClosed()) {
    throw new Error("client not ready");
  }

  let chatId = `${to}@c.us`;
  try {
    const numberId = await client.getNumberId(to);
    if (numberId?._serialized) {
      chatId = numberId._serialized;
    }
  } catch (err) {
    console.warn(`getNumberId check for ${to} failed, falling back to ${chatId}:`, err?.message);
  }

  const sent = await client.sendMessage(chatId, message);
  const id = sent?.id?._serialized ?? null;
  if (!sent) {
    console.warn(`send to ${to} (${chatId}): WhatsApp returned no message model (unknown id)`);
  }
  return { ok: true, id, chatId };
}

app.get("/status", async (_req, res) => {
  const pageHealthy = client.pupPage && !client.pupPage.isClosed();
  const isOk = ready && pageHealthy && !isRestarting;
  res.json({ ready: isOk, number: linkedNumber });
});

function qrPng(res) {
  if (ready) return res.status(409).json({ ok: false, error: "already linked" });
  if (!qrDataUrl) return res.status(204).end();
  const base64 = qrDataUrl.split(",")[1] || "";
  return res.type("png").send(Buffer.from(base64, "base64"));
}

// A tiny auto-refreshing page so a human can scan the (rotating) QR.
app.get("/qr", (req, res) => {
  if (!qrKeyOk(req)) {
    return res.status(401).json({ ok: false, error: "bad token" });
  }
  const keyParam = QR_TOKEN && String(req.query.token || "") === QR_TOKEN
    ? `token=${encodeURIComponent(QR_TOKEN)}`
    : `secret=${encodeURIComponent(String(req.query.secret || ""))}`;
  res.type("html").send(`<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Golden Spark — link WhatsApp</title>
<style>
  body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;
       gap:12px;padding:24px;background:#fff;color:#111}
  img{width:280px;height:280px;image-rendering:pixelated;border:1px solid #ddd;border-radius:12px}
  p{font-size:14px;color:#555;text-align:center;max-width:340px;margin:0}
</style>
<h2>Link Golden Spark WhatsApp</h2>
<img id="qr" alt="QR code" src="qr.png?${keyParam}">
<p id="msg">Scan with WhatsApp → Settings → Linked devices → Link a device.</p>
<script>
  var key = ${JSON.stringify(keyParam)};
  var img = document.getElementById("qr");
  var msg = document.getElementById("msg");
  function refresh() {
    fetch("status", { cache: "no-store" }).then(function (r) { return r.json(); })
      .then(function (s) {
        if (s.ready) {
          img.style.display = "none";
          msg.textContent = "WhatsApp is linked. You can close this page.";
          return;
        }
        img.src = "qr.png?" + key + "&t=" + Date.now();
        setTimeout(refresh, 8000);
      })
      .catch(function () { setTimeout(refresh, 8000); });
  }
  refresh();
</script>`);
});

// Raw PNG of the current QR, for previews/scripts.
app.get("/qr.png", (req, res) => {
  if (!qrKeyOk(req)) {
    return res.status(401).json({ ok: false, error: "bad token" });
  }
  return qrPng(res);
});

app.post("/send", async (req, res) => {
  try {
    if (req.body.secret !== SECRET) {
      return res.status(401).json({ ok: false, error: "bad secret" });
    }
    if (!ready || isRestarting) {
      return res.status(503).json({ ok: false, error: "not ready" });
    }
    const to = String(req.body.to || "").replace(/\D/g, "");
    const message = String(req.body.message || "").slice(0, 4000);
    if (to.length < 10 || !message) {
      return res.status(400).json({ ok: false, error: "bad to/message" });
    }

    const result = await enqueueSend(to, message);
    return res.json(result);
  } catch (err) {
    const errMsg = err && err.message ? err.message : String(err);
    console.error("send failed:", errMsg);

    // If page context is lost or WWebJS undefined, trigger auto-restart
    if (
      errMsg.includes("getChat") ||
      errMsg.includes("context was destroyed") ||
      errMsg.includes("Session closed") ||
      errMsg.includes("Target closed") ||
      errMsg.includes("protocolTimeout")
    ) {
      triggerRestart("Fatal send error: " + errMsg);
    }

    return res.status(500).json({ ok: false, error: errMsg });
  }
});

// Periodic ping every 60s to ensure WhatsApp Web page stays active and doesn't get evicted
setInterval(async () => {
  if (!ready || isRestarting) return;
  try {
    if (!client.pupPage || client.pupPage.isClosed()) {
      triggerRestart("Healthcheck: page closed");
      return;
    }
    const injected = await client.pupPage.evaluate(() => typeof window.WWebJS !== "undefined");
    if (!injected) {
      triggerRestart("Healthcheck: window.WWebJS not defined");
    }
  } catch (err) {
    console.warn("Healthcheck warning:", err?.message);
    if (
      String(err?.message).includes("Session closed") ||
      String(err?.message).includes("destroyed") ||
      String(err?.message).includes("Target closed")
    ) {
      triggerRestart("Healthcheck failure: " + err.message);
    }
  }
}, 60000);

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  const msg = String(err);
  if (
    msg.includes("auth timeout") ||
    msg.includes("Target closed") ||
    msg.includes("Session closed") ||
    msg.includes("destroyed")
  ) {
    triggerRestart("Unhandled rejection: " + msg);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  triggerRestart("Uncaught exception: " + err?.message);
});

app.listen(PORT, () => console.log(`wa-sender on :${PORT}`));

client.initialize().catch((err) => {
  console.error("Client initialization failed:", err);
  triggerRestart("initialize failed: " + err);
});

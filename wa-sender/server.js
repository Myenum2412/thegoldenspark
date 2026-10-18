// Golden Spark WhatsApp sender (https://wwebjs.dev).
// Runs whatsapp-web.js with a persistent logged-in session and exposes
// a tiny HTTP API the Next.js site calls to auto-send order confirmations.
//
//   POST /send  { to, message, secret }  ->  { ok: true, id }
//   GET  /status                          ->  { ready: bool }
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

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    ...(EXECUTABLE_PATH ? { executablePath: EXECUTABLE_PATH } : {}),
  },
});

let ready = false;
let qrDataUrl = null;

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

client.on("authenticated", () => console.log("WhatsApp authenticated."));
client.on("auth_failure", (m) => console.error("Auth failed:", m));
client.on("ready", () => {
  ready = true;
  qrDataUrl = null;
  console.log("WhatsApp sender ready.");
});
client.on("disconnected", (reason) => {
  ready = false;
  qrDataUrl = null;
  // Exit so pm2 restarts us; LocalAuth keeps the session, so a normal
  // drop reconnects without a new scan. A real logout will show a QR.
  console.log("Disconnected:", reason, "— restarting to reconnect…");
  setTimeout(() => process.exit(1), 3000);
});

app.get("/status", (_req, res) => {
  res.json({ ready });
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
    if (!ready) {
      return res.status(503).json({ ok: false, error: "not ready" });
    }
    const to = String(req.body.to || "").replace(/\D/g, "");
    const message = String(req.body.message || "").slice(0, 4000);
    if (to.length < 10 || !message) {
      return res.status(400).json({ ok: false, error: "bad to/message" });
    }
    const chatId = `${to}@c.us`;
    const sent = await client.sendMessage(chatId, message);
    return res.json({ ok: true, id: sent.id._serialized });
  } catch (err) {
    console.error("send failed:", err && err.message);
    return res.status(500).json({ ok: false, error: "send failed" });
  }
});

app.listen(PORT, () => console.log(`wa-sender on :${PORT}`));
client.initialize();

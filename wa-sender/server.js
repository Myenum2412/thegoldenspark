// Golden Spark WhatsApp sender (https://wwebjs.dev).
// Runs whatsapp-web.js with a persistent logged-in session and exposes
// a tiny HTTP API the Next.js site calls to auto-send order confirmations.
//
//   POST /send  { to, message, secret }  ->  { ok: true, id }
//   GET  /status                          ->  { ready: bool }
//
// Keep this process running 24/7 (pm2 / systemd / Railway / VPS).
// It CANNOT run on Vercel serverless — Chromium + session need a server.

const express = require("express");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PORT = Number(process.env.PORT || 3101);
const SECRET = process.env.WA_SECRET || "";

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
  },
});

let ready = false;

client.on("qr", (qr) => {
  ready = false;
  console.log("Scan this QR with the sender phone (WhatsApp → Linked devices):");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => console.log("WhatsApp authenticated."));
client.on("auth_failure", (m) => console.error("Auth failed:", m));
client.on("ready", () => {
  ready = true;
  console.log("WhatsApp sender ready.");
});
client.on("disconnected", (reason) => {
  ready = false;
  console.log("Disconnected:", reason, "— restart to re-login.");
});

app.get("/status", (_req, res) => {
  res.json({ ready });
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

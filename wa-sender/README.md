# Golden Spark WhatsApp sender (wwebjs)

Auto-sends order confirmations to customers via
[whatsapp-web.js](https://wwebjs.dev). This must run on an
always-on machine (VPS / Railway / home server) — **not Vercel**,
because it needs Chromium + a persistent login session.

## Setup (once)

1. `cd wa-sender && npm install`
2. Copy `.env.example` → `.env`, set a long random `WA_SECRET`.
3. `npm start` → a QR prints in the terminal.
4. Scan it with the phone that should send confirmations
   (WhatsApp → Settings → Linked devices → Link a device).
5. Session is saved in `.wwebjs_auth/` — next starts need no scan.
6. Keep it alive: `pm2 start server.js --name wa-sender` (or systemd).
7. Make it reachable from the website: public URL
   (VPS IP / Cloudflare Tunnel / Tailscale). Note the URL.

## Connect the website

In the site env (`.env.local` + Vercel project settings):

```bash
WA_SENDER_URL=https://your-sender-host:3101
WA_SENDER_SECRET=same-secret-as-above
```

Checkout then auto-sends the confirmation to the customer's number.
If the sender is offline, the site falls back to opening WhatsApp
manually — nothing breaks.

## Endpoints

- `GET /status` → `{ "ready": true }`
- `POST /send` `{ to, message, secret }` → `{ ok, id }`
  (`to` = digits, e.g. `919876543210`)

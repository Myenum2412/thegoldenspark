# Appwrite backend setup for Golden Spark (`sasi`)

Project: `6ac84fa0002e5ccfa934` · Endpoint: `https://sfo.cloud.appwrite.io/v1`

The app code is fully migrated to Appwrite. Nothing works until the
backend below exists — create it once in the Appwrite console, then set
the IDs in `.env.local` and restart the app.

## 1. Auth user

Appwrite Console → Auth → Users → Create user:

- Email: `thegoldenspark@gmail.com`
- Password: `@Amar2412` (or any password — update whoever logs in)

Login uses `account.createEmailPasswordSession`, so any user in this
project can sign in at `/login`.

## 2. Database

Databases → Create database (any name, e.g. `gsh`). Copy its **Database ID**
into `.env.local` as `NEXT_PUBLIC_APPWRITE_DATABASE_ID`.

## 3. Collections

Create these 4 collections inside that database. Attribute types in
parentheses. All attributes except where noted are **required**.

### products → `NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS`

| key | type | size |
|---|---|---|
| item_no | integer | required |
| ordr | integer | not required |
| name | string | 256, required |
| category | string | 128, required |
| packing | string | 32, required |
| mrp | double | required |
| special_rate | double | required |
| stock | integer | required |
| image | string | 256, not required |

`ordr` is the product's position in the printed 2026 pricelist (1 = first
item on the list, e.g. `G09` KURINJI (A) → `G12` PALAI (E) run in order). The
home page lists products in this order, so keep it in sync when the pricelist
changes.

The applied order lives in `docs/pricelist-order.json` (ordered by barcode).
Apply it to the live table with:

```bash
node --env-file=.env.local scripts/apply-pricelist-order.mjs
```

`image` holds a filename from `public/Diwali` (e.g. `Vibrant Flower Pots
Fireworks Box.png`). The homepage pricelist shows it as a thumbnail; clicking
it opens a product detail popup. Assign it per product from the dashboard
(Products → edit) using the image picker.

All product artwork is served from `public/Diwali`; the storefront no longer
depends on Appwrite Storage for images. The applied image assignments live in
`docs/product-image-map.json` (keyed by barcode) and can be re-applied with:

```bash
node --env-file=.env.local scripts/apply-product-images.mjs --dry-run
node --env-file=.env.local scripts/apply-product-images.mjs
```

The script refuses to write a filename that is not present in
`public/Diwali`, so a typo cannot blank a product card.

Permissions: **Any → Read**. (The public homepage pricelist reads this
without login.) Create/Update/Delete: **Users** (dashboard, logged in).

### customers → `NEXT_PUBLIC_APPWRITE_COLLECTION_CUSTOMERS`

| key | type | size |
|---|---|---|
| name | string | 128, required |
| address | string | 512, required |
| pincode | string | 16, required |
| phone | string | 32, required |

Permissions: **Any → Create** (homepage checkout saves here without
login). Read/Update/Delete: **Users**.

### orders → `NEXT_PUBLIC_APPWRITE_COLLECTION_ORDERS`

| key | type | size |
|---|---|---|
| customer_id | string | 64, not required |
| customer_name | string | 128, required |
| phone | string | 32, required |
| total | double | required |
| status | string | 32, required |

Permissions: **Any → Create**. Read/Update/Delete: **Users**.
The app sets `status: "new"` on create.

### order_items → `NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ITEMS`

| key | type | size |
|---|---|---|
| order_id | string | 64, required |
| product_id | string | 64, not required |
| item_no | integer | required |
| name | string | 256, required |
| qty | integer | required |
| rate | double | required |
| amount | double | required |

Permissions: **Any → Create**. Read/Update/Delete: **Users**.

## 4. Seed the pricelist

`docs/pricelist-seed.json` holds the 116 products from the 2026 list.
Import it with a script against the products collection, e.g.:

```bash
node -e "
const { Client, Databases, ID } = require('appwrite');
const rows = require('./docs/pricelist-seed.json');
const databases = new Databases(new Client()
  .setEndpoint('https://sfo.cloud.appwrite.io/v1')
  .setProject('6ac84fa0002e5ccfa934')
  .setKey('YOUR_API_KEY'));
(async () => {
  for (const row of rows) {
    await databases.createDocument('DATABASE_ID', 'PRODUCTS_COLLECTION_ID', ID.unique(), row);
  }
  console.log('imported', rows.length);
})();
"
```

(Requires an API key with `databases` scope — create one under
Project Settings → API keys. Never commit the key.)

## 5. Env

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=6ac84fa0002e5ccfa934
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<database id>
NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS=<collection id>
NEXT_PUBLIC_APPWRITE_COLLECTION_CUSTOMERS=<collection id>
NEXT_PUBLIC_APPWRITE_COLLECTION_ORDERS=<collection id>
NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ITEMS=<collection id>
```

Until these are set, every dashboard page shows a notice explaining the
backend is not configured yet — that is expected, not a bug.

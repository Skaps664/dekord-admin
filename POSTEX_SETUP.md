# PostEx integration — setup

Everything is built. Three steps to turn it on.

---

## Step 1 (required) — run the migration

Supabase Dashboard → SQL Editor → New query → paste
`src/migrations/2026-08-24-postex-integration.sql` → Run.

It adds bookkeeping columns to `orders`. **Nothing works until this is run** —
booking, sync and the webhook all read those columns.

No new tables: the PostEx city list is cached in memory by the API routes.

---

## Step 2 (required) — point the webhook at the admin panel

merchant.postex.pk → **API Integration Guide** → **Webhook Configuration**:

| Field | Value |
|---|---|
| Status Updates Webhook | `https://<your-admin-domain>/api/postex/webhook` |
| Header Key | `x-postex-secret` |
| Header Value | `DEs5-cUUjRTw4MKbzqiSGDVfx6FJmGuQaCPLtTTeSaY` |

Then **Save**.

That secret is already in `.env.local` as `POSTEX_WEBHOOK_SECRET`. Add the same
value to your Vercel project's environment variables, along with
`POSTEX_API_TOKEN` and `POSTEX_PICKUP_ADDRESS_CODE=001`.

Without the webhook, everything still works — orders just won't update
themselves; you'd use **Sync now** or wait for the 3-hourly sweep.

---

## Step 3 (optional) — the safety net

`vercel.json` already schedules `/api/postex/sync` every 3 hours to catch
anything a missed webhook left stale. Set a `CRON_SECRET` in Vercel if you want
that endpoint locked to the cron job specifically.

---

## How it behaves

**When you mark an order Processing** it books with PostEx automatically, saves
the tracking number, courier and tracking URL, and the customer's tracking
button starts working. In bulk you get one summary:
*"17 booked with PostEx · 2 need another courier · 1 booking failed"*.

**After that it runs itself.** PostEx pushes each status change; the order moves
to Shipped when the rider collects it and Delivered when it lands, firing the
existing WhatsApp and email at each point.

**When something goes wrong** the order appears under the red **Needs
attention** tab in Orders, with the reason. Nothing fails silently, and a
courier problem never blocks the status change or the stock deduction.

**When PostEx doesn't deliver to a city**, the order is flagged for another
courier. Book it with Trax or Leopards and fill in the courier + tracking
fields that were already on the order page. The customer sees no difference.

---

## City matching

Customer-typed cities are resolved against PostEx's live list in three passes:

1. **Exact** after normalising case, spaces and punctuation — `Peshawar` → `PESHAWAR`
2. **Alias** for abbreviations — `LHR` → `Lahore`, `Pindi` → `Rawalpindi`, `isb` → `Islamabad`
3. **Fuzzy** at 0.92 or better — `Peshwar` → `PESHAWAR`, `Islmabad` → `Islamabad`, `krachi` → `Karachi`

Anything below that is treated as "PostEx doesn't serve this", not as an error.

Deliberately **not** normalised away: words like "Cantt" and "City". Stripping
them merges `Lahore` with `LAHORE CANTT` and `Karachi` with `KARACHI CITY`,
which are different delivery areas.

---

## Things worth knowing

The v4.1.9 PDF is wrong in several places. These were all verified against the
live API and the code follows reality, not the document:

- Tracking numbers are plain 14-digit numbers, not `CX-XXXXXXXXXXX`
- `operationalCityType` only accepts lowercase; the PDF's capitalised values 400
- List Orders wants `orderStatusId`/`startDate`/`endDate`, not `orderStatusID`/`fromDate`/`toDate`
- There are 20 order statuses, not 13, and some contain an unrendered `{14}` token
- `orderType` is `Reversed`, not `Reverse`
- The same order reports `Un-Assigned By Me` on one endpoint and `Cancelled` on another

Two subtleties the code handles:

- **"At DEKORD Warehouse" means the parcel is still in your shop**, not shipped.
  PostEx substitutes your merchant name into that message, so it looks like the
  "At PostEx Warehouse" one. Treating them the same would tell customers their
  order shipped while it sat on your shelf.
- **Booking is never retried automatically.** A timed-out create-order request
  may still have created the shipment, and retrying would duplicate it.

---

## Files

```
src/lib/postex/client.ts    PostEx API calls, retries, timeouts
src/lib/postex/cities.ts    city cache + exact/alias/fuzzy resolution
src/lib/postex/status.ts    PostEx status -> dekord status
src/lib/postex/orders.ts    booking, status application, notifications

src/app/api/postex/book     called when an order moves to Processing
src/app/api/postex/webhook  PostEx pushes status changes here
src/app/api/postex/sync     "Sync now" + the scheduled sweep
src/app/api/postex/cancel   cancel a booking
src/app/api/postex/label    airway bill PDF
src/app/api/postex/cities   city list for the manual picker
```

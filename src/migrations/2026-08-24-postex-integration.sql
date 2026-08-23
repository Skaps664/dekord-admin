-- ============================================================================
-- PostEx integration
-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- Adds bookkeeping columns to `orders`. No new tables: the PostEx city list is
-- cached in memory by the API routes, so there is nothing else to maintain.
-- ============================================================================

-- What PostEx currently says about this order, in their own words.
alter table public.orders add column if not exists postex_status text;

-- When we booked it, and when PostEx last told us anything about it.
alter table public.orders add column if not exists postex_booked_at     timestamptz;
alter table public.orders add column if not exists postex_last_event_at timestamptz;

-- Why the last booking or sync failed, in plain language, shown on the order.
alter table public.orders add column if not exists postex_last_error text;

-- Drives the "Needs attention" tab in the admin Orders list.
alter table public.orders add column if not exists postex_needs_attention boolean not null default false;
alter table public.orders add column if not exists postex_attention_reason text;

-- Raw webhook body, kept for debugging (PostEx doesn't document its payload).
alter table public.orders add column if not exists postex_last_webhook jsonb;

create index if not exists orders_postex_attention_idx
  on public.orders (postex_needs_attention)
  where postex_needs_attention = true;

create index if not exists orders_tracking_number_idx
  on public.orders (tracking_number)
  where tracking_number is not null;

# Hiatus

Online ordering + customer accounts for Hiatus coffee shop, built with Next.js (App
Router) and Supabase. Cash-on-pickup checkout, star ratings/reviews, and an admin
dashboard with a best-selling-flavor analytics view.

## Stack

- Next.js 16 (App Router, TypeScript, Server Actions)
- Supabase (Postgres, Auth, Storage) via `@supabase/ssr`
- Tailwind CSS
- Recharts (admin analytics chart)

## One-time setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the schema**: open the SQL editor in your Supabase project and run the
   contents of [`supabase/schema.sql`](supabase/schema.sql). This creates all
   tables, RLS policies, the `create_order`/`cancel_order`/`update_order_status`/
   `best_selling_flavors` RPC functions, and the public `menu-images` storage bucket.
3. **Set env vars**: copy `.env.local.example` to `.env.local` and fill in your
   project's URL and anon key (Project Settings → API in the Supabase dashboard).
4. **Install deps and run**:
   ```bash
   npm install
   npm run dev
   ```
5. **Make yourself an admin**: sign up through the running app with your own
   account, then in the Supabase SQL editor run:
   ```sql
   update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'you@example.com');
   ```
   There's no public "become admin" flow by design — admin accounts are provisioned
   manually.
6. **Add menu items** at `/admin/menu` — each item needs a `flavor`, which drives
   both the customer-facing filter and the best-seller analytics.

## How it works

- **Ordering**: cart lives in `localStorage` (`src/lib/cart-context.tsx`). Checkout
  calls the `create_order` Postgres function, which re-derives prices from the
  current menu server-side — the client never gets to dictate what an order costs.
- **Roles**: a `role` column on `profiles` (`customer` | `admin`), checked via the
  `is_admin()` SQL function and enforced both in Supabase RLS and in
  `src/proxy.ts` (Next's request-time gate for `/admin/*` and other authed routes).
- **Ratings**: a customer can only rate a menu item if RLS finds a `completed`
  order of theirs containing that item — see the `ratings_insert_if_purchased`
  policy in `supabase/schema.sql`.
- **"Best-selling flavor"**: the `best_selling_flavors` SQL function aggregates
  `order_items` by flavor for completed orders, filterable by a day range. This is
  a plain analytics rollup, not a trained ML model — see `/admin` for the chart.

## Current scope (v1)

Pickup only, cash on pickup (no payment gateway). Delivery and online payment
(e.g. GCash/PayMongo) are natural next additions once the ordering flow is
validated in the shop.

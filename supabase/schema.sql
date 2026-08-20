-- Hiatus coffee shop schema, RLS policies, and RPC functions
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

-- ============================================================================
-- PROFILES
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer function so RLS on profiles doesn't recurse into itself
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- customers may edit their own name/phone, but never their own role
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_manage"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- MENU ITEMS
-- ============================================================================
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  flavor text not null,
  category text not null default 'coffee',
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create policy "menu_items_public_read"
  on public.menu_items for select
  using (true);

create policy "menu_items_admin_write"
  on public.menu_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- ORDERS
-- ============================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount numeric(10, 2) not null default 0,
  pickup_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_select_own_or_admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- no direct insert/update policies for orders: all writes go through the
-- security-definer RPCs below, so prices/status transitions can't be forged
-- by a client sending arbitrary values.

-- ============================================================================
-- ORDER ITEMS
-- ============================================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  item_name text not null,
  flavor text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(10, 2) not null
);

alter table public.order_items enable row level security;

create policy "order_items_select_own_or_admin"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- ============================================================================
-- RATINGS
-- ============================================================================
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  order_id uuid not null references public.orders (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, menu_item_id, order_id)
);

alter table public.ratings enable row level security;

create policy "ratings_public_read"
  on public.ratings for select
  using (true);

-- can only rate an item that was actually part of one of your own completed orders
create policy "ratings_insert_if_purchased"
  on public.ratings for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.id = ratings.order_id
        and o.user_id = auth.uid()
        and o.status = 'completed'
        and oi.menu_item_id = ratings.menu_item_id
    )
  );

create policy "ratings_update_own"
  on public.ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ratings_delete_own"
  on public.ratings for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- RPC: create_order — server-computed pricing, prevents client price tampering
-- ============================================================================
create or replace function public.create_order(items jsonb, pickup_note text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  computed_total numeric(10, 2) := 0;
  line jsonb;
  item public.menu_items%rowtype;
  line_qty integer;
  line_subtotal numeric(10, 2);
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if jsonb_array_length(items) = 0 then
    raise exception 'cart is empty';
  end if;

  insert into public.orders (user_id, status, total_amount, pickup_note)
  values (auth.uid(), 'pending', 0, pickup_note)
  returning id into new_order_id;

  for line in select * from jsonb_array_elements(items)
  loop
    select * into item from public.menu_items
      where id = (line ->> 'menu_item_id')::uuid and is_available = true;

    if not found then
      raise exception 'menu item % is not available', line ->> 'menu_item_id';
    end if;

    line_qty := (line ->> 'quantity')::integer;
    if line_qty is null or line_qty <= 0 then
      raise exception 'invalid quantity for menu item %', item.id;
    end if;

    line_subtotal := item.price * line_qty;
    computed_total := computed_total + line_subtotal;

    insert into public.order_items
      (order_id, menu_item_id, item_name, flavor, unit_price, quantity, subtotal)
    values
      (new_order_id, item.id, item.name, item.flavor, item.price, line_qty, line_subtotal);
  end loop;

  update public.orders set total_amount = computed_total where id = new_order_id;

  return new_order_id;
end;
$$;

grant execute on function public.create_order(jsonb, text) to authenticated;

-- ============================================================================
-- RPC: cancel_order — customer can cancel only their own still-pending order
-- ============================================================================
create or replace function public.cancel_order(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
    set status = 'cancelled', updated_at = now()
    where id = target_order_id
      and user_id = auth.uid()
      and status = 'pending';

  if not found then
    raise exception 'order not found, not yours, or no longer cancellable';
  end if;
end;
$$;

grant execute on function public.cancel_order(uuid) to authenticated;

-- ============================================================================
-- RPC: update_order_status — admin-only order status transitions
-- ============================================================================
create or replace function public.update_order_status(target_order_id uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if new_status not in ('pending', 'preparing', 'ready', 'completed', 'cancelled') then
    raise exception 'invalid status %', new_status;
  end if;

  update public.orders
    set status = new_status, updated_at = now()
    where id = target_order_id;

  if not found then
    raise exception 'order not found';
  end if;
end;
$$;

grant execute on function public.update_order_status(uuid, text) to authenticated;

-- ============================================================================
-- RPC: best_selling_flavors — admin analytics ("ML" scope: SQL aggregation)
-- ============================================================================
create or replace function public.best_selling_flavors(days_back integer default null)
returns table (flavor text, total_quantity bigint, total_revenue numeric, order_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    oi.flavor,
    sum(oi.quantity)::bigint as total_quantity,
    sum(oi.subtotal) as total_revenue,
    count(distinct oi.order_id)::bigint as order_count
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status = 'completed'
    and public.is_admin()
    and (days_back is null or o.created_at >= now() - (days_back || ' days')::interval)
  group by oi.flavor
  order by total_quantity desc;
$$;

grant execute on function public.best_selling_flavors(integer) to authenticated;

-- ============================================================================
-- STORAGE: menu item images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "menu_images_public_read"
  on storage.objects for select
  using (bucket_id = 'menu-images');

create policy "menu_images_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'menu-images' and public.is_admin());

create policy "menu_images_admin_update"
  on storage.objects for update
  using (bucket_id = 'menu-images' and public.is_admin());

create policy "menu_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'menu-images' and public.is_admin());

-- ============================================================================
-- SEED: a first admin account
-- ============================================================================
-- After you sign up through the app with your own admin email, run:
--   update public.profiles set role = 'admin' where id =
--     (select id from auth.users where email = 'you@example.com');

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  balance numeric not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text,
  input_type text not null default 'uid' check (input_type in ('uid', 'uid_zone', 'username_password')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  games_id uuid references public.games(id) on delete set null,
  name text not null,
  game_name text,
  category text not null check (category in ('topup', 'code', 'account')),
  input_type text check (input_type in ('uid', 'uid_zone', 'username_password')),
  price numeric not null check (price >= 0),
  image_url text,
  description text,
  stock_total integer not null default 0 check (stock_total >= 0),
  stock_left integer not null default 0 check (stock_left >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.game_codes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  type text not null default 'code' check (type in ('code', 'account')),
  code text,
  acc_username text,
  acc_password text,
  is_used boolean not null default false,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.deposit_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  method text not null check (method in ('bank', 'phone_transfer', 'card', 'code')),
  amount_requested numeric not null default 0,
  amount_received numeric not null default 0,
  fee_percent numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
  phone_number text,
  card_number text,
  slip_url text,
  slip_hash text unique,
  promo_code text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topup_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  game_name text not null,
  input_type text,
  uid text,
  zone_id text,
  username text,
  password text,
  price numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.code_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  game_code_id uuid references public.game_codes(id) on delete set null,
  price numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.balance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount numeric not null,
  ref_type text,
  ref_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  value numeric not null check (value > 0),
  max_uses integer not null default 1 check (max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_code_usages (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  deposit_order_id uuid references public.deposit_orders(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (promo_code_id, user_id)
);

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_games_id on public.products(games_id);
create index if not exists idx_game_codes_product_unused on public.game_codes(product_id, is_used, sort_order);
create index if not exists idx_deposit_orders_user_status on public.deposit_orders(user_id, status);
create index if not exists idx_topup_orders_user_status on public.topup_orders(user_id, status);
create index if not exists idx_code_orders_user on public.code_orders(user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_deposit_orders_updated_at on public.deposit_orders;
create trigger touch_deposit_orders_updated_at
before update on public.deposit_orders
for each row execute function public.touch_updated_at();

drop trigger if exists touch_topup_orders_updated_at on public.topup_orders;
create trigger touch_topup_orders_updated_at
before update on public.topup_orders
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id and role = 'admin'
  );
$$;

create or replace function public.deduct_balance(p_user_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'Invalid amount';
  end if;

  update public.profiles
  set balance = balance - p_amount
  where id = p_user_id and balance >= p_amount;

  if not found then
    raise exception 'Insufficient balance';
  end if;
end;
$$;

create or replace function public.approve_deposit(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.deposit_orders%rowtype;
begin
  select * into v_order
  from public.deposit_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Deposit order not found';
  end if;

  if v_order.status = 'success' then
    return jsonb_build_object('success', true, 'already_approved', true);
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Deposit order is not pending';
  end if;

  update public.deposit_orders
  set status = 'success'
  where id = p_order_id;

  update public.profiles
  set balance = balance + v_order.amount_received
  where id = v_order.user_id;

  insert into public.balance_transactions (user_id, type, amount, ref_type, ref_id, note)
  values (v_order.user_id, 'deposit', v_order.amount_received, 'deposit_order', p_order_id, 'Deposit approved');

  return jsonb_build_object('success', true, 'amount', v_order.amount_received);
end;
$$;

create or replace function public.refund_topup(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.topup_orders%rowtype;
begin
  select * into v_order
  from public.topup_orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Topup order not found';
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Topup order is not pending';
  end if;

  update public.topup_orders
  set status = 'failed'
  where id = p_order_id;

  update public.profiles
  set balance = balance + v_order.price
  where id = v_order.user_id;

  insert into public.balance_transactions (user_id, type, amount, ref_type, ref_id, note)
  values (v_order.user_id, 'refund', v_order.price, 'topup_order', p_order_id, 'Topup refunded');

  return jsonb_build_object('success', true, 'amount', v_order.price);
end;
$$;

create or replace function public.buy_game_code(p_user_id uuid, p_product_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_code public.game_codes%rowtype;
  v_order_id uuid;
begin
  select * into v_product
  from public.products
  where id = p_product_id
  for update;

  if not found or not v_product.is_active or v_product.category not in ('code', 'account') then
    raise exception 'Product not available';
  end if;

  if v_product.stock_left <= 0 then
    raise exception 'Out of stock';
  end if;

  perform public.deduct_balance(p_user_id, v_product.price);

  select * into v_code
  from public.game_codes
  where product_id = p_product_id and is_used = false
  order by sort_order asc, created_at asc
  for update skip locked
  limit 1;

  if not found then
    raise exception 'No unused code found';
  end if;

  update public.game_codes
  set is_used = true,
      used_by = p_user_id,
      used_at = now()
  where id = v_code.id;

  update public.products
  set stock_left = greatest(stock_left - 1, 0)
  where id = p_product_id;

  insert into public.code_orders (user_id, product_id, game_code_id, price)
  values (p_user_id, p_product_id, v_code.id, v_product.price)
  returning id into v_order_id;

  insert into public.balance_transactions (user_id, type, amount, ref_type, ref_id, note)
  values (p_user_id, 'purchase', -v_product.price, 'code_order', v_order_id, 'Code purchase');

  return jsonb_build_object('success', true, 'order_id', v_order_id, 'game_code_id', v_code.id);
end;
$$;

revoke all on function public.deduct_balance(uuid, numeric) from public, anon, authenticated;
revoke all on function public.approve_deposit(uuid) from public, anon, authenticated;
revoke all on function public.refund_topup(uuid) from public, anon, authenticated;
revoke all on function public.buy_game_code(uuid, uuid) from public, anon, authenticated;
grant execute on function public.deduct_balance(uuid, numeric) to service_role;
grant execute on function public.approve_deposit(uuid) to service_role;
grant execute on function public.refund_topup(uuid) to service_role;
grant execute on function public.buy_game_code(uuid, uuid) to service_role;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.products enable row level security;
alter table public.game_codes enable row level security;
alter table public.deposit_orders enable row level security;
alter table public.topup_orders enable row level security;
alter table public.code_orders enable row level security;
alter table public.balance_transactions enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_code_usages enable row level security;
alter table public.settings enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin(auth.uid()));
create policy "profiles_update_own_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin(auth.uid()));

create policy "games_public_active_read" on public.games
for select using (is_active = true or public.is_admin(auth.uid()));
create policy "games_admin_all" on public.games
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "products_public_active_read" on public.products
for select using (is_active = true or public.is_admin(auth.uid()));
create policy "products_admin_all" on public.products
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "game_codes_user_or_admin_read" on public.game_codes
for select using (used_by = auth.uid() or public.is_admin(auth.uid()));
create policy "game_codes_admin_all" on public.game_codes
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "deposit_orders_user_or_admin_read" on public.deposit_orders
for select using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "deposit_orders_user_insert" on public.deposit_orders
for insert with check (user_id = auth.uid());
create policy "deposit_orders_user_update_own_pending" on public.deposit_orders
for update using (user_id = auth.uid() and status = 'pending') with check (user_id = auth.uid());
create policy "deposit_orders_admin_all" on public.deposit_orders
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "topup_orders_user_or_admin_read" on public.topup_orders
for select using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "topup_orders_admin_all" on public.topup_orders
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "code_orders_user_or_admin_read" on public.code_orders
for select using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "code_orders_admin_all" on public.code_orders
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "balance_transactions_user_or_admin_read" on public.balance_transactions
for select using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "balance_transactions_admin_all" on public.balance_transactions
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "promo_codes_admin_all" on public.promo_codes
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "promo_code_usages_user_or_admin_read" on public.promo_code_usages
for select using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "promo_code_usages_admin_all" on public.promo_code_usages
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "settings_public_read" on public.settings
for select using (true);
create policy "settings_admin_all" on public.settings
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

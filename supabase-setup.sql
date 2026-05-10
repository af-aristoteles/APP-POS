-- ============================================
-- POS SYSTEM - COMPLETE DATABASE SETUP
-- Jalankan SEMUA SQL ini sekaligus di Supabase SQL Editor
-- ============================================

-- ============================================
-- BAGIAN 1: BERSIHKAN SEMUA YANG LAMA
-- ============================================

-- Hapus views dulu
drop view if exists public.v_low_stock_products;

-- Hapus triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists update_products_updated_at on public.products;
drop trigger if exists update_categories_updated_at on public.categories;
drop trigger if exists set_invoice_number on public.transactions;
drop trigger if exists trigger_update_stock on public.transactions;

-- Hapus functions
drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at_column();
drop function if exists public.generate_invoice_number();
drop function if exists public.update_stock_after_transaction();

-- Hapus tabel (urutan matter karena foreign keys)
drop table if exists public.stock_alerts cascade;
drop table if exists public.transaction_items cascade;
drop table if exists public.transactions cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.stock_logs cascade;

-- ============================================
-- BAGIAN 2: BUAT TABEL
-- ============================================

-- TABEL: user_profiles (untuk auth & role management)
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null default 'User',
  role text not null default 'kasir' check (role in ('admin', 'kasir')),
  created_at timestamptz default now()
);

-- TABEL: categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABEL: products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  sku varchar(50) unique not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  price decimal(12, 2) not null default 0,
  cost_price decimal(12, 2) default 0,
  stock integer not null default 0,
  min_stock integer not null default 10,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TABEL: transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  invoice_number varchar(50) unique not null,
  total_amount decimal(12, 2) not null,
  payment_method varchar(20) not null default 'cash',
  amount_paid decimal(12, 2) not null,
  change_amount decimal(12, 2) default 0,
  cashier_name varchar(100),
  notes text,
  created_at timestamptz default now()
);

-- TABEL: transaction_items
create table public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.transactions(id) on delete cascade,
  product_id uuid references public.products(id) on delete restrict,
  product_name varchar(200) not null,
  quantity integer not null,
  price decimal(12, 2) not null,
  subtotal decimal(12, 2) not null
);

-- TABEL: stock_alerts
create table public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  product_name varchar(200) not null,
  current_stock integer not null,
  min_stock integer not null,
  alert_type varchar(20) default 'low_stock',
  is_resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================
-- BAGIAN 3: INDEXES
-- ============================================

create index idx_products_category on public.products(category_id);
create index idx_products_stock on public.products(stock);
create index idx_products_min_stock on public.products(min_stock);
create index idx_products_active on public.products(is_active);
create index idx_transactions_created on public.transactions(created_at);
create index idx_transaction_items_transaction on public.transaction_items(transaction_id);
create index idx_stock_alerts_unresolved on public.stock_alerts(is_resolved);

-- ============================================
-- BAGIAN 4: FUNCTIONS & TRIGGERS
-- ============================================

-- FUNCTION 1: Auto-generate invoice number
create or replace function public.generate_invoice_number()
returns trigger
language plpgsql
as $$
begin
  new.invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(cast(coalesce(
    (select count(*) from public.transactions where invoice_number like 'INV-' || to_char(now(), 'YYYYMMDD') || '-%') + 1, 1) as text), 4, '0');
  return new;
end;
$$;

create trigger set_invoice_number
before insert on public.transactions
for each row
when (new.invoice_number is null or new.invoice_number = '')
execute function public.generate_invoice_number();

-- FUNCTION 2: Auto-reduce stock & create alerts after transaction
create or replace function public.update_stock_after_transaction()
returns trigger
language plpgsql
as $$
declare
  v_product record;
  v_product_name text;
  v_current_stock integer;
  v_min_stock integer;
begin
  for v_product in
    select ti.product_id, ti.quantity
    from public.transaction_items ti
    where ti.transaction_id = new.id
  loop
    update public.products
    set stock = stock - v_product.quantity
    where id = v_product.product_id;

    select p.name, p.stock, p.min_stock
    into v_product_name, v_current_stock, v_min_stock
    from public.products p
    where p.id = v_product.product_id;

    if v_current_stock <= v_min_stock then
      if not exists (
        select 1 from public.stock_alerts
        where product_id = v_product.product_id and is_resolved = false
      ) then
        insert into public.stock_alerts (product_id, product_name, current_stock, min_stock, alert_type)
        values (v_product.product_id, v_product_name, v_current_stock, v_min_stock, 'low_stock');
      end if;
    end if;
  end loop;
  return new;
end;
$$;

create trigger trigger_update_stock
after insert on public.transactions
for each row
execute function public.update_stock_after_transaction();

-- FUNCTION 3: Auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_products_updated_at
before update on public.products
for each row
execute function public.update_updated_at_column();

create trigger update_categories_updated_at
before update on public.categories
for each row
execute function public.update_updated_at_column();

-- FUNCTION 4: Auto-create user profile saat register (trigger dari auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role text;
begin
  v_name := coalesce(
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'User'
  );
  v_role := coalesce(new.raw_user_meta_data->>'role', 'kasir');

  insert into public.user_profiles (id, email, name, role)
  values (new.id, new.email, v_name, v_role);

  return new;
exception
  when others then
    -- Kalau gagal, tetap izinkan user dibuat (profile bisa dibuat manual nanti)
    raise warning 'Failed to create user profile: %', sqlerrm;
    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================
-- BAGIAN 5: RLS (ROW LEVEL SECURITY)
-- ============================================

-- user_profiles: disable RLS agar tidak konflik dengan trigger auth
alter table public.user_profiles disable row level security;

-- Tabel lainnya: enable RLS dengan policy allow all (bisa di-hardening nanti)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.stock_alerts enable row level security;

create policy "Allow all on categories" on public.categories for all using (true) with check (true);
create policy "Allow all on products" on public.products for all using (true) with check (true);
create policy "Allow all on transactions" on public.transactions for all using (true) with check (true);
create policy "Allow all on transaction_items" on public.transaction_items for all using (true) with check (true);
create policy "Allow all on stock_alerts" on public.stock_alerts for all using (true) with check (true);

-- ============================================
-- BAGIAN 6: VIEW - Low Stock Products
-- ============================================

create or replace view public.v_low_stock_products as
select
  p.id,
  p.name,
  p.sku,
  p.stock,
  p.min_stock,
  c.name as category_name,
  case
    when p.stock = 0 then 'habis'
    when p.stock <= p.min_stock / 2 then 'kritis'
    else 'menipis'
  end as alert_level
from public.products p
left join public.categories c on p.category_id = c.id
where p.stock <= p.min_stock and p.is_active = true
order by p.stock asc;

-- ============================================
-- BAGIAN 7: SEED DATA - Sample Categories
-- ============================================

insert into public.categories (name, description) values
  ('Minuman', 'Berbagai jenis minuman'),
  ('Makanan', 'Berbagai jenis makanan'),
  ('Snack', 'Camilan dan snack'),
  ('Elektronik', 'Produk elektronik'),
  ('Kecantikan', 'Produk perawatan dan kecantikan'),
  ('Kebutuhan Rumah Tangga', 'Perlengkapan rumah tangga');

-- ============================================
-- BAGIAN 8: SEED DATA - Sample Products
-- ============================================

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Kopi Susu', 'KPS001', id, 15000, 8000, 50, 10 from public.categories where name = 'Minuman' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Teh Botol', 'TBT001', id, 8000, 4000, 100, 15 from public.categories where name = 'Minuman' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Air Mineral', 'AMN001', id, 5000, 2000, 200, 20 from public.categories where name = 'Minuman' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Nasi Goreng', 'NGR001', id, 20000, 10000, 30, 5 from public.categories where name = 'Makanan' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Mie Instan', 'MIS001', id, 5000, 2500, 8, 15 from public.categories where name = 'Makanan' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Roti Bakar', 'RBK001', id, 12000, 6000, 25, 8 from public.categories where name = 'Makanan' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Keripik Singkong', 'KRS001', id, 10000, 5000, 45, 10 from public.categories where name = 'Snack' limit 1;

insert into public.products (name, sku, category_id, price, cost_price, stock, min_stock)
select 'Coklat Batang', 'CKB001', id, 15000, 8000, 60, 10 from public.categories where name = 'Snack' limit 1;

-- ============================================
-- SELESAI - Semua tabel, trigger, dan data sudah siap
-- ============================================
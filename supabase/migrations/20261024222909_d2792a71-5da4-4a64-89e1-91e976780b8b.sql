-- ===== PKMREPS schema (odtworzona po przełączeniu na zewnętrzny Supabase) =====

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  referral_url text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.ai_access_blocks (
  feature text primary key,
  message text not null,
  status int not null default 403,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create unique index categories_slug_key on public.categories (slug);

create table public.guide_steps (
  id uuid primary key default gen_random_uuid(),
  step_number int not null default 1,
  title text not null,
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  username text not null default '',
  password_hash text not null default '',
  description text not null default '',
  logo_url text,
  banner_url text,
  external_url text not null default '',
  link_mode text not null default 'agents',
  active boolean not null default true,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index sellers_slug_key on public.sellers (slug);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default '',
  price numeric not null default 0,
  price_cny numeric not null default 0,
  image_url text,
  images text[] not null default '{}',
  qc_url text,
  qc_images text[] not null default '{}',
  store_url text not null default '',
  store_name text not null default '',
  quality text not null default '',
  batch text not null default '',
  sizes text[] not null default '{}',
  tiktok_url text,
  views int not null default 0,
  likes int not null default 0,
  dislikes int not null default 0,
  promoted boolean not null default false,
  for_women boolean not null default false,
  verified boolean not null default false,
  show_on_home boolean not null default false,
  seller_id uuid references public.sellers (id) on delete set null,
  display_order int not null default 0,
  agent_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index products_display_order_idx on public.products (display_order);
create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at desc);
create index products_seller_idx on public.products (seller_id);

create table public.promos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text,
  link_url text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value text not null default ''
);

create table public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  line_name text not null default 'Standard',
  base_price numeric not null default 0,
  price_per_kg numeric not null default 0,
  min_weight numeric not null default 0,
  max_weight numeric not null default 0,
  sort_order int not null default 0,
  price_table jsonb not null default '{}'::jsonb,
  discount_percent numeric not null default 0,
  coupon_code text not null default '',
  signup_url text not null default '',
  created_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null default '',
  icon text not null default '',
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid references public.sellers (id) on delete set null,
  role text not null,
  unique (user_id, role)
);

-- ===== Widok publicznych danych sklepu (bez hasła) =====
create view public.sellers_public as
  select id, name, slug, username, description, logo_url, banner_url,
         external_url, link_mode, active, created_at, updated_at
  from public.sellers;

-- ===== Funkcja roli (security definer) =====
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- ===== Triggers updated_at =====
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;
create trigger sellers_updated_at before update on public.sellers
  for each row execute function public.set_updated_at();

-- ===== Granty =====
grant select on public.agents to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.guide_steps to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.promos to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant select on public.shipping_rates to anon, authenticated;
grant select on public.social_links to anon, authenticated;
grant select (id, name, slug, username, description, logo_url, banner_url, external_url, link_mode, active, user_id, created_at, updated_at) on public.sellers to anon, authenticated;
grant select on public.sellers_public to anon, authenticated;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
grant all on public.agents to service_role;
grant all on public.ai_access_blocks to service_role;
grant all on public.categories to service_role;
grant all on public.guide_steps to service_role;
grant all on public.sellers to service_role;
grant all on public.products to service_role;
grant all on public.promos to service_role;
grant all on public.settings to service_role;
grant all on public.shipping_rates to service_role;
grant all on public.social_links to service_role;

-- ===== RLS =====
alter table public.agents enable row level security;
alter table public.ai_access_blocks enable row level security;
alter table public.categories enable row level security;
alter table public.guide_steps enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.promos enable row level security;
alter table public.settings enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.social_links enable row level security;
alter table public.user_roles enable row level security;

create policy "Publiczna odczyt: agents" on public.agents for select to anon, authenticated using (true);
create policy "Publiczna odczyt: categories" on public.categories for select to anon, authenticated using (true);
create policy "Publiczna odczyt: guide_steps" on public.guide_steps for select to anon, authenticated using (true);
create policy "Publiczna odczyt: products" on public.products for select to anon, authenticated using (true);
create policy "Publiczna odczyt: promos" on public.promos for select to anon, authenticated using (true);
create policy "Publiczna odczyt: settings" on public.settings for select to anon, authenticated using (true);
create policy "Publiczna odczyt: shipping_rates" on public.shipping_rates for select to anon, authenticated using (true);
create policy "Publiczna odczyt: social_links" on public.social_links for select to anon, authenticated using (true);
create policy "Publiczna odczyt: sellers" on public.sellers for select to anon, authenticated using (true);
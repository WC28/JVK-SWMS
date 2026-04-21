create table if not exists public.allowed_users (
  email text primary key,
  display_name text not null default '',
  role text not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint allowed_users_role_check check (role in ('admin', 'editor', 'viewer'))
);

create index if not exists allowed_users_role_idx
  on public.allowed_users (role, is_active);

alter table public.allowed_users enable row level security;

create table if not exists public.app_users (
  username text primary key,
  password_hash text not null,
  display_name text not null default '',
  role text not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint app_users_role_check check (role in ('admin', 'editor', 'viewer'))
);

create index if not exists app_users_role_idx
  on public.app_users (role, is_active);

alter table public.app_users enable row level security;

-- สร้าง admin เริ่มต้นชั่วคราว โดยใช้ password = ChangeMe123!
insert into public.app_users (username, password_hash, display_name, role, is_active)
values (
  'admin',
  '0a692d59dfb95cc2db1e4f029e1af0d5:0465a50b9cd99aa34ecb11a4469ae1eb9b466b12004e90ad5bf370a2f1943abb3018fc9de596eb03c8e82a4e8ea0eac7cdcccc62e518284ac66d0bbc1e1822e6',
  'ผู้ดูแลระบบ',
  'admin',
  true
)
on conflict (username)
do nothing;

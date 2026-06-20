alter table public.users
  add column if not exists current_plan text not null default 'free',
  add column if not exists subscription_status public.subscription_status not null default 'active',
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_expires_at timestamptz;

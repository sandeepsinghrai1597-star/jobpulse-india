alter table public.payments
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_signature text,
  add column if not exists notes jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists payments_razorpay_order_id_key
  on public.payments (razorpay_order_id)
  where razorpay_order_id is not null;

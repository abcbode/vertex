-- VERTEX binary-options platform schema

create table if not exists profiles (
  user_id text primary key,
  display_name text not null default '',
  phone text not null default '',
  role text not null default 'user',
  status text not null default 'active',
  totp_secret text,
  totp_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists wallets (
  user_id text primary key,
  balance numeric(18,2) not null default 0,
  total_deposit numeric(18,2) not null default 0,
  total_withdraw numeric(18,2) not null default 0,
  total_win numeric(18,2) not null default 0,
  total_loss numeric(18,2) not null default 0,
  total_volume numeric(18,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists ledger (
  id serial primary key,
  user_id text not null,
  type text not null,
  amount numeric(18,2) not null,
  balance_after numeric(18,2) not null,
  ref_type text,
  ref_id integer,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists ledger_user_id_idx on ledger (user_id, created_at desc);

create table if not exists bank_accounts (
  id serial primary key,
  bank_name text not null,
  bank_code text not null default '',
  account_number text not null,
  account_name text not null,
  branch text not null default '',
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists qr_codes (
  id serial primary key,
  bank_account_id integer,
  label text not null default 'QR',
  image_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text not null
);

create table if not exists user_banks (
  id serial primary key,
  user_id text not null,
  bank_name text not null,
  bank_code text not null default '',
  account_number text not null,
  account_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists user_banks_user_id_idx on user_banks (user_id);

create table if not exists deposits (
  id serial primary key,
  user_id text not null,
  amount numeric(18,2) not null,
  bank_account_id integer,
  transfer_content text not null,
  status text not null default 'pending',
  admin_note text not null default '',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists deposits_user_id_idx on deposits (user_id, created_at desc);
create index if not exists deposits_status_idx on deposits (status, created_at desc);

create table if not exists withdrawals (
  id serial primary key,
  user_id text not null,
  amount numeric(18,2) not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  status text not null default 'pending',
  admin_note text not null default '',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists withdrawals_user_id_idx on withdrawals (user_id, created_at desc);
create index if not exists withdrawals_status_idx on withdrawals (status, created_at desc);

create table if not exists assets (
  id serial primary key,
  symbol text not null unique,
  name text not null,
  base_price numeric(18,6) not null,
  current_price numeric(18,6) not null,
  decimals integer not null default 2,
  payout numeric(6,2) not null default 85,
  up_ratio numeric(5,2) not null default 50,
  is_active boolean not null default true,
  trading_paused boolean not null default false,
  trade_start text,
  trade_end text,
  last_tick_at bigint,
  sort_order integer not null default 0
);

create table if not exists timeframes (
  id serial primary key,
  seconds integer not null unique,
  label text not null,
  is_active boolean not null default true
);

create table if not exists expiries (
  id serial primary key,
  seconds integer not null unique,
  label text not null,
  is_active boolean not null default true
);

create table if not exists candles (
  id serial primary key,
  asset_id integer not null,
  timeframe_seconds integer not null,
  open_time bigint not null,
  open numeric(18,6) not null,
  high numeric(18,6) not null,
  low numeric(18,6) not null,
  close numeric(18,6) not null,
  unique (asset_id, timeframe_seconds, open_time)
);
create index if not exists candles_lookup_idx on candles (asset_id, timeframe_seconds, open_time desc);

create table if not exists candle_overrides (
  id serial primary key,
  asset_id integer not null,
  timeframe_seconds integer,
  open_time bigint,
  direction text not null,
  applied boolean not null default false,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists trades (
  id serial primary key,
  user_id text not null,
  asset_id integer not null,
  direction text not null,
  amount numeric(18,2) not null,
  payout numeric(6,2) not null,
  expiry_seconds integer not null,
  entry_price numeric(18,6) not null,
  exit_price numeric(18,6),
  status text not null default 'running',
  profit numeric(18,2),
  opened_at timestamptz not null default now(),
  expires_at timestamptz not null,
  settled_at timestamptz
);
create index if not exists trades_user_id_idx on trades (user_id, opened_at desc);
create index if not exists trades_running_idx on trades (status, expires_at);

create table if not exists support_agents (
  id serial primary key,
  name text not null,
  avatar_url text not null default '',
  bio text not null default '',
  telegram text not null default '',
  zalo text not null default '',
  messenger text not null default '',
  phone text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists notifications (
  id serial primary key,
  title text not null,
  body text not null,
  image_url text not null default '',
  type text not null default 'in_app',
  audience text not null default 'all',
  target_user_id text,
  target_group text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists notification_reads (
  notification_id integer not null,
  user_id text not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create table if not exists activity_logs (
  id serial primary key,
  user_id text,
  actor_role text not null default 'user',
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on activity_logs (created_at desc);

create table if not exists login_history (
  id serial primary key,
  user_id text not null,
  ip text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists login_history_user_idx on login_history (user_id, created_at desc);

create table if not exists admin_2fa_ok (
  user_id text primary key,
  verified_at timestamptz not null default now()
);

create table if not exists password_resets (
  id serial primary key,
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists error_logs (
  id serial primary key,
  message text not null,
  stack text not null default '',
  created_at timestamptz not null default now()
);

-- seed settings
insert into settings (key, value) values
  ('site_name', 'VERTEX'),
  ('transfer_prefix', 'VERTEX'),
  ('welcome_bonus', '5000000'),
  ('min_deposit', '50000'),
  ('min_withdraw', '100000'),
  ('min_trade', '50000'),
  ('max_trade', '100000000'),
  ('maintenance', 'false')
on conflict (key) do nothing;

insert into assets (symbol, name, base_price, current_price, decimals, payout, up_ratio, sort_order) values
  ('BTCUSD', 'Bitcoin / USD', 67450.00, 67450.00, 2, 85, 50, 1),
  ('ETHUSD', 'Ethereum / USD', 3452.80, 3452.80, 2, 85, 50, 2),
  ('EURUSD', 'Euro / USD', 1.08540, 1.08540, 5, 82, 50, 3),
  ('XAUUSD', 'Gold / USD', 2648.30, 2648.30, 2, 80, 50, 4),
  ('USDJPY', 'USD / Yen', 149.220, 149.220, 3, 82, 50, 5),
  ('USOIL', 'Crude Oil', 78.460, 78.460, 3, 80, 50, 6)
on conflict (symbol) do nothing;

insert into timeframes (seconds, label, is_active) values
  (5, '5s', true),
  (15, '15s', true),
  (30, '30s', true),
  (60, '1m', true),
  (300, '5m', true)
on conflict (seconds) do nothing;

insert into expiries (seconds, label, is_active) values
  (15, '15 giây', true),
  (30, '30 giây', true),
  (60, '1 phút', true),
  (180, '3 phút', true),
  (300, '5 phút', true)
on conflict (seconds) do nothing;

insert into bank_accounts (id, bank_name, bank_code, account_number, account_name, branch, is_active, is_default)
values (1, 'Vietcombank', '970436', '0123456789', 'CONG TY VERTEX', 'Ha Noi', true, true)
on conflict (id) do nothing;

insert into qr_codes (id, bank_account_id, label, image_url, is_active)
values (1, 1, 'Vietcombank QR', '', true)
on conflict (id) do nothing;

insert into support_agents (id, name, bio, telegram, zalo, messenger, phone, is_active, sort_order)
values
  (1, 'Minh Anh', 'Cham soc tai khoan va nap rut 24/7.', 'https://t.me/vertex_cskh', 'https://zalo.me/0901234567', 'https://m.me/vertex', '0901234567', true, 1),
  (2, 'Quoc Huy', 'Ho tro giao dich va lich su lenh.', 'https://t.me/vertex_trade', 'https://zalo.me/0907654321', 'https://m.me/vertex', '0907654321', true, 2)
on conflict (id) do nothing;

insert into notifications (id, title, body, type, audience)
values (1, 'Chao mung den VERTEX', 'Nap tien de bat dau giao dich Binary Options. Payout len den 85%. Lien he CSKH neu can ho tro.', 'both', 'all')
on conflict (id) do nothing;

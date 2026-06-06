-- Integrations (payment gateways, SMTP, etc.)
create table if not exists integrations (
  id integer primary key autoincrement,
  provider text not null,
  name text not null default '',
  status text not null default 'active',
  settings_json text not null default '{}',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

-- Checkouts
create table if not exists checkouts (
  id integer primary key autoincrement,
  name text not null default '',
  slug text not null default '',
  status text not null default 'draft',
  price real not null default 0,
  currency text not null default 'BRL',
  gateway_id text not null default 'mercadopago',
  document_mode text not null default 'both',
  banner_enabled integer not null default 1,
  banner_url text not null default '',
  course_ids_json text not null default '[]',
  payment_methods_json text not null default '[]',
  settings_json text not null default '{}',
  public_url text not null default '',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create unique index if not exists checkouts_slug_idx on checkouts(slug);

-- Orders
create table if not exists orders (
  id integer primary key autoincrement,
  checkout_id integer,
  student_id integer,
  checkout_name text not null default '',
  student_name text not null default '',
  student_email text not null default '',
  amount real not null default 0,
  currency text not null default 'BRL',
  status text not null default 'pending',
  payment_method text not null default 'card',
  gateway_id text not null default '',
  gateway_order_id text not null default '',
  metadata_json text not null default '{}',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

-- App settings (key-value store for dashboard style, etc.)
create table if not exists settings (
  key text primary key not null,
  value_json text not null default 'null',
  updated_at text not null default (datetime('now'))
);

-- Enrollments table (if not already present)
create table if not exists enrollments (
  id integer primary key autoincrement,
  user_id integer not null,
  course_id integer not null,
  status text not null default 'active',
  source text not null default 'manual',
  enrolled_at text not null default (datetime('now')),
  created_at text not null default (datetime('now')),
  unique(user_id, course_id)
);

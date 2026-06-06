create table if not exists installations (
  id text primary key,
  license_key text,
  app_version text not null default '0.1.0',
  schema_version integer not null default 1,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists users (
  id integer primary key autoincrement,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'student',
  status text not null default 'active',
  avatar_url text,
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists courses (
  id integer primary key autoincrement,
  title text not null,
  slug text not null unique,
  excerpt text,
  description_html text,
  status text not null default 'draft',
  visibility text not null default 'private',
  cover_image_url text,
  banner_image_url text,
  appearance_json text not null default '{}',
  sort_order integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists course_sections (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  title text not null,
  status text not null default 'published',
  sort_order integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists modules (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  section_id integer references course_sections(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'draft',
  cover_image_url text,
  sort_order integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists lessons (
  id integer primary key autoincrement,
  course_id integer not null references courses(id) on delete cascade,
  module_id integer not null references modules(id) on delete cascade,
  title text not null,
  description_html text,
  video_provider text,
  video_url text,
  video_embed_html text,
  duration_seconds integer not null default 0,
  status text not null default 'draft',
  materials_json text not null default '[]',
  sort_order integer not null default 0,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists enrollments (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  course_id integer not null references courses(id) on delete cascade,
  status text not null default 'active',
  source text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp,
  unique(user_id, course_id)
);

create table if not exists lesson_progress (
  id integer primary key autoincrement,
  user_id integer not null references users(id) on delete cascade,
  course_id integer not null references courses(id) on delete cascade,
  lesson_id integer not null references lessons(id) on delete cascade,
  completed integer not null default 0,
  position_seconds integer not null default 0,
  updated_at text not null default current_timestamp,
  unique(user_id, lesson_id)
);

create table if not exists products (
  id integer primary key autoincrement,
  name text not null,
  slug text not null unique,
  price_cents integer not null default 0,
  currency text not null default 'BRL',
  course_ids_json text not null default '[]',
  status text not null default 'draft',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists checkouts (
  id integer primary key autoincrement,
  product_id integer references products(id) on delete set null,
  name text not null,
  slug text not null unique,
  status text not null default 'draft',
  settings_json text not null default '{}',
  payment_methods_json text not null default '[]',
  content_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists orders (
  id integer primary key autoincrement,
  checkout_id integer references checkouts(id) on delete set null,
  product_id integer references products(id) on delete set null,
  user_id integer references users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_document text,
  customer_phone text,
  status text not null default 'pending',
  payment_method text,
  gateway text,
  gateway_order_id text,
  amount_cents integer not null default 0,
  currency text not null default 'BRL',
  metadata_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists integrations (
  id integer primary key autoincrement,
  provider text not null,
  name text not null,
  status text not null default 'disabled',
  public_key text,
  secret_encrypted text,
  settings_json text not null default '{}',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists email_templates (
  key text primary key,
  title text not null,
  subject text not null,
  body_html text not null,
  enabled integer not null default 1,
  updated_at text not null default current_timestamp
);

create table if not exists settings (
  key text primary key,
  value_json text not null,
  updated_at text not null default current_timestamp
);

create index if not exists idx_courses_status on courses(status);
create index if not exists idx_modules_course on modules(course_id);
create index if not exists idx_lessons_module on lessons(module_id);
create index if not exists idx_enrollments_user on enrollments(user_id);
create index if not exists idx_enrollments_course on enrollments(course_id);
create index if not exists idx_orders_customer_email on orders(customer_email);
create index if not exists idx_orders_status on orders(status);

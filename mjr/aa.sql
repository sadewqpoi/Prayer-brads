create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- الزوار يقرؤون المنتجات المنشورة فقط
create policy "Anyone can read published products"
on public.products for select
to anon, authenticated
using (published = true);

-- أضف هذه السياسة بعد إعداد دور المدير الموثوق أدناه

insert into public.admin_users (user_id)
values ('sbp_7318964bf59e2555787bd56aa38c4c971ed8fb45');


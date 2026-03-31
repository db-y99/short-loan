-- Tạo bảng chi nhánh
create table "public"."branches" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "address" text,
  "phone" text,
  "status" text not null default 'active',
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  "deleted_at" timestamp with time zone
);

-- Thêm branch_id vào profiles
alter table "public"."profiles"
  add column "branch_id" uuid references "public"."branches"("id") on delete set null;

-- Thêm branch_id vào loans
alter table "public"."loans"
  add column "branch_id" uuid references "public"."branches"("id") on delete set null;

-- Index
create index on "public"."profiles"("branch_id");
create index on "public"."loans"("branch_id");

-- Trigger updated_at cho branches
create trigger branches_updated_at
  before update on "public"."branches"
  for each row execute function public.update_updated_at();

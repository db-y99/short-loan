create type "public"."activity_log_type" as enum ('message', 'system_event', 'image_upload', 'approval', 'contract_created', 'contract_signed', 'disbursement');

create type "public"."loan_status" as enum ('pending', 'approved', 'rejected', 'disbursed', 'completed');

create type "public"."loan_file_type" as enum (
  'asset_lease_contract',
  'asset_disposal_authorization',
  'full_payment_confirmation',
  'asset_pledge_contract'
);

create type "public"."payment_period_status" as enum ('pending', 'paid', 'overdue');


  create table "public"."customers" (
    "id" uuid primary key default gen_random_uuid(),
    "full_name" text not null,
    "cccd" text not null,
    "phone" text not null,
    "address" text not null,
    "cccd_issue_date" date,
    "cccd_issue_place" text,
    "facebook_link" text,
    "job" text,
    "income" numeric(18,2),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
  );


  create table "public"."loan_activity_logs" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "type" public.activity_log_type not null,
    "user_id" text not null,
    "user_name" text not null,
    "content" text,
    "system_message" text,
    "links" text[],
    "images" text[],
    "mentions" text[],
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
  );

  create table "public"."loan_assets" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "name" text,
    "provider" text not null,
    "file_id" text not null,
    "position" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
  );



  create table "public"."loan_files" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "name" text not null,
    "type" public.loan_file_type not null,
    "provider" text not null,
    "file_id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
  );



  create table "public"."loan_references" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "full_name" text not null,
    "phone" text not null,
    "relationship" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
  );



  create table "public"."loans" (
    "id" uuid primary key default gen_random_uuid(),
    "code" text not null,
    "creator" text not null,
    "customer_id" uuid not null,
    "asset_type" text not null,
    "asset_name" text not null,
    "asset_identity" jsonb not null, -- {chassis_number: string, engine_number: string, imei: string, serial: string}
    "amount" numeric(18,2) not null,
    "loan_package" text,
    "loan_type" text not null,
    "appraisal_fee_percentage" numeric(5,2),
    "appraisal_fee" numeric(18,2),
    "bank_name" text,
    "bank_account_holder" text,
    "bank_account_number" text,
    "notes" text,
    "status" public.loan_status not null default 'pending'::public.loan_status,
    "status_message" text,
    "signed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "is_signed" boolean not null default false,
     -- 🔥 Drive integration
    "drive_folder_id" text not null, -- folder của loan

    "current_cycle" integer not null default 1,
    "cycle_start_date" date,
    "cycle_end_date" date,

    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
  );


  create table "public"."loan_payment_cycles" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "cycle_number" integer not null,
    "principal" numeric(18,2) not null,
    "start_date" date not null,
    "end_date" date not null,
    "created_at" timestamp with time zone not null default now()
  );

  create table "public"."loan_payment_periods" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "cycle_id" uuid not null,
    "period_number" integer not null, -- 1,2,3
    "milestone_day" integer not null,
    "due_date" date not null,
    "interest_fee" numeric(18,2) not null,
    "total_due" numeric(18,2) not null,
    "status" public.payment_period_status not null default 'pending'::public.payment_period_status,
    "created_at" timestamp with time zone not null default now()
  );



  create table "public"."loan_interest_payments" (
    "id" uuid primary key default gen_random_uuid(),
    "loan_id" uuid not null,
    "cycle_id" uuid not null,
    "period_id" uuid,
    "amount" numeric(18,2) not null,
    "staff_id" text not null,
    "staff_name" text not null,
    "paid_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now()
  );

  create extension if not exists moddatetime schema extensions;


create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger handle_updated_at
before update on public.customers
for each row
execute procedure extensions.moddatetime(updated_at);


create trigger handle_updated_at
before update on public.loans
for each row
execute procedure extensions.moddatetime(updated_at);

create trigger handle_updated_at
before update on public.loan_files
for each row
execute procedure extensions.moddatetime(updated_at);

create trigger handle_updated_at
before update on public.loan_references
for each row
execute procedure extensions.moddatetime(updated_at);

create trigger handle_updated_at
before update on public.loan_activity_logs
for each row
execute procedure extensions.moddatetime(updated_at);

create trigger handle_updated_at
before update on public.loan_assets
for each row
execute procedure extensions.moddatetime(updated_at);


alter table public.loan_payment_cycles
add constraint loan_payment_cycles_loan_id_fkey
foreign key (loan_id)
references public.loans(id)
on delete cascade;

alter table public.loan_payment_periods
add constraint loan_payment_periods_loan_id_fkey
foreign key (loan_id)
references public.loans(id)
on delete cascade;

alter table public.loan_payment_periods
add constraint loan_payment_periods_cycle_id_fkey
foreign key (cycle_id)
references public.loan_payment_cycles(id)
on delete cascade;


alter table public.loan_interest_payments
add constraint loan_interest_payments_loan_id_fkey
foreign key (loan_id)
references public.loans(id)
on delete cascade;

alter table public.loan_interest_payments
add constraint loan_interest_payments_cycle_id_fkey
foreign key (cycle_id)
references public.loan_payment_cycles(id)
on delete cascade;

alter table public.loan_interest_payments
add constraint loan_interest_payments_period_id_fkey
foreign key (period_id)
references public.loan_payment_periods(id)
on delete set null;


create index loan_payment_cycles_loan_idx
on public.loan_payment_cycles (loan_id);

create index loan_payment_periods_loan_idx
on public.loan_payment_periods (loan_id);

create index loan_payment_periods_cycle_idx
on public.loan_payment_periods (cycle_id);

create index loan_payment_periods_due_date_idx
on public.loan_payment_periods (due_date);

create index loan_interest_payments_loan_idx
on public.loan_interest_payments (loan_id);

create index loan_interest_payments_cycle_idx
on public.loan_interest_payments (cycle_id);

create index loan_interest_payments_paid_at_idx
on public.loan_interest_payments (paid_at desc);

create unique index loan_cycle_unique
on public.loan_payment_cycles (loan_id, cycle_number);

create unique index loan_period_unique
on public.loan_payment_periods (cycle_id, period_number);




CREATE UNIQUE INDEX loans_code_unique ON public.loans USING btree (code);

CREATE UNIQUE INDEX customers_cccd_unique ON public.customers USING btree (cccd);

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);

CREATE INDEX loan_activity_logs_loan_ts_idx ON public.loan_activity_logs USING btree (loan_id, created_at DESC);

CREATE INDEX loan_assets_loan_id_idx ON public.loan_assets USING btree (loan_id);

CREATE INDEX loan_files_loan_id_idx ON public.loan_files USING btree (loan_id);

CREATE INDEX loan_references_loan_id_idx ON public.loan_references USING btree (loan_id);

CREATE INDEX loans_created_at_idx ON public.loans USING btree (created_at DESC);

CREATE INDEX loans_customer_id_idx ON public.loans USING btree (customer_id);

CREATE INDEX loans_status_idx ON public.loans USING btree (status);


alter table "public"."customers" add constraint "customers_cccd_unique" UNIQUE using index "customers_cccd_unique";

alter table "public"."loan_activity_logs" add constraint "loan_activity_logs_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_activity_logs" validate constraint "loan_activity_logs_loan_id_fkey";

alter table "public"."loan_assets" add constraint "loan_assets_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_assets" validate constraint "loan_assets_loan_id_fkey";

alter table "public"."loan_files" add constraint "loan_files_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_files" validate constraint "loan_files_loan_id_fkey";

alter table "public"."loan_references" add constraint "loan_references_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_references" validate constraint "loan_references_loan_id_fkey";

alter table "public"."loans" add constraint "loans_code_unique" UNIQUE using index "loans_code_unique";

alter table "public"."loans" add constraint "loans_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT not valid;

alter table "public"."loans" validate constraint "loans_customer_id_fkey";

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "postgres";

grant insert on table "public"."customers" to "postgres";

grant references on table "public"."customers" to "postgres";

grant select on table "public"."customers" to "postgres";

grant trigger on table "public"."customers" to "postgres";

grant truncate on table "public"."customers" to "postgres";

grant update on table "public"."customers" to "postgres";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."loan_activity_logs" to "anon";

grant insert on table "public"."loan_activity_logs" to "anon";

grant references on table "public"."loan_activity_logs" to "anon";

grant select on table "public"."loan_activity_logs" to "anon";

grant trigger on table "public"."loan_activity_logs" to "anon";

grant truncate on table "public"."loan_activity_logs" to "anon";

grant update on table "public"."loan_activity_logs" to "anon";

grant delete on table "public"."loan_activity_logs" to "authenticated";

grant insert on table "public"."loan_activity_logs" to "authenticated";

grant references on table "public"."loan_activity_logs" to "authenticated";

grant select on table "public"."loan_activity_logs" to "authenticated";

grant trigger on table "public"."loan_activity_logs" to "authenticated";

grant truncate on table "public"."loan_activity_logs" to "authenticated";

grant update on table "public"."loan_activity_logs" to "authenticated";

grant delete on table "public"."loan_activity_logs" to "postgres";

grant insert on table "public"."loan_activity_logs" to "postgres";

grant references on table "public"."loan_activity_logs" to "postgres";

grant select on table "public"."loan_activity_logs" to "postgres";

grant trigger on table "public"."loan_activity_logs" to "postgres";

grant truncate on table "public"."loan_activity_logs" to "postgres";

grant update on table "public"."loan_activity_logs" to "postgres";

grant delete on table "public"."loan_activity_logs" to "service_role";

grant insert on table "public"."loan_activity_logs" to "service_role";

grant references on table "public"."loan_activity_logs" to "service_role";

grant select on table "public"."loan_activity_logs" to "service_role";

grant trigger on table "public"."loan_activity_logs" to "service_role";

grant truncate on table "public"."loan_activity_logs" to "service_role";

grant update on table "public"."loan_activity_logs" to "service_role";

grant delete on table "public"."loan_assets" to "anon";

grant insert on table "public"."loan_assets" to "anon";

grant references on table "public"."loan_assets" to "anon";

grant select on table "public"."loan_assets" to "anon";

grant trigger on table "public"."loan_assets" to "anon";

grant truncate on table "public"."loan_assets" to "anon";

grant update on table "public"."loan_assets" to "anon";

grant delete on table "public"."loan_assets" to "authenticated";

grant insert on table "public"."loan_assets" to "authenticated";

grant references on table "public"."loan_assets" to "authenticated";

grant select on table "public"."loan_assets" to "authenticated";

grant trigger on table "public"."loan_assets" to "authenticated";

grant truncate on table "public"."loan_assets" to "authenticated";

grant update on table "public"."loan_assets" to "authenticated";

grant delete on table "public"."loan_assets" to "postgres";

grant insert on table "public"."loan_assets" to "postgres";

grant references on table "public"."loan_assets" to "postgres";

grant select on table "public"."loan_assets" to "postgres";

grant trigger on table "public"."loan_assets" to "postgres";

grant truncate on table "public"."loan_assets" to "postgres";

grant update on table "public"."loan_assets" to "postgres";

grant delete on table "public"."loan_assets" to "service_role";

grant insert on table "public"."loan_assets" to "service_role";

grant references on table "public"."loan_assets" to "service_role";

grant select on table "public"."loan_assets" to "service_role";

grant trigger on table "public"."loan_assets" to "service_role";

grant truncate on table "public"."loan_assets" to "service_role";

grant update on table "public"."loan_assets" to "service_role";

grant delete on table "public"."loan_files" to "anon";

grant insert on table "public"."loan_files" to "anon";

grant references on table "public"."loan_files" to "anon";

grant select on table "public"."loan_files" to "anon";

grant trigger on table "public"."loan_files" to "anon";

grant truncate on table "public"."loan_files" to "anon";

grant update on table "public"."loan_files" to "anon";

grant delete on table "public"."loan_files" to "authenticated";

grant insert on table "public"."loan_files" to "authenticated";

grant references on table "public"."loan_files" to "authenticated";

grant select on table "public"."loan_files" to "authenticated";

grant trigger on table "public"."loan_files" to "authenticated";

grant truncate on table "public"."loan_files" to "authenticated";

grant update on table "public"."loan_files" to "authenticated";

grant delete on table "public"."loan_files" to "postgres";

grant insert on table "public"."loan_files" to "postgres";

grant references on table "public"."loan_files" to "postgres";

grant select on table "public"."loan_files" to "postgres";

grant trigger on table "public"."loan_files" to "postgres";

grant truncate on table "public"."loan_files" to "postgres";

grant update on table "public"."loan_files" to "postgres";

grant delete on table "public"."loan_files" to "service_role";

grant insert on table "public"."loan_files" to "service_role";

grant references on table "public"."loan_files" to "service_role";

grant select on table "public"."loan_files" to "service_role";

grant trigger on table "public"."loan_files" to "service_role";

grant truncate on table "public"."loan_files" to "service_role";

grant update on table "public"."loan_files" to "service_role";

grant delete on table "public"."loan_references" to "anon";

grant insert on table "public"."loan_references" to "anon";

grant references on table "public"."loan_references" to "anon";

grant select on table "public"."loan_references" to "anon";

grant trigger on table "public"."loan_references" to "anon";

grant truncate on table "public"."loan_references" to "anon";

grant update on table "public"."loan_references" to "anon";

grant delete on table "public"."loan_references" to "authenticated";

grant insert on table "public"."loan_references" to "authenticated";

grant references on table "public"."loan_references" to "authenticated";

grant select on table "public"."loan_references" to "authenticated";

grant trigger on table "public"."loan_references" to "authenticated";

grant truncate on table "public"."loan_references" to "authenticated";

grant update on table "public"."loan_references" to "authenticated";

grant delete on table "public"."loan_references" to "postgres";

grant insert on table "public"."loan_references" to "postgres";

grant references on table "public"."loan_references" to "postgres";

grant select on table "public"."loan_references" to "postgres";

grant trigger on table "public"."loan_references" to "postgres";

grant truncate on table "public"."loan_references" to "postgres";

grant update on table "public"."loan_references" to "postgres";

grant delete on table "public"."loan_references" to "service_role";

grant insert on table "public"."loan_references" to "service_role";

grant references on table "public"."loan_references" to "service_role";

grant select on table "public"."loan_references" to "service_role";

grant trigger on table "public"."loan_references" to "service_role";

grant truncate on table "public"."loan_references" to "service_role";

grant update on table "public"."loan_references" to "service_role";

grant delete on table "public"."loans" to "authenticated";

grant insert on table "public"."loans" to "authenticated";

grant references on table "public"."loans" to "authenticated";

grant select on table "public"."loans" to "authenticated";

grant trigger on table "public"."loans" to "authenticated";

grant truncate on table "public"."loans" to "authenticated";

grant update on table "public"."loans" to "authenticated";

grant delete on table "public"."loans" to "authenticated";

grant insert on table "public"."loans" to "authenticated";

grant references on table "public"."loans" to "authenticated";

grant select on table "public"."loans" to "authenticated";

grant trigger on table "public"."loans" to "authenticated";

grant truncate on table "public"."loans" to "authenticated";

grant update on table "public"."loans" to "authenticated";

grant delete on table "public"."loans" to "postgres";

grant insert on table "public"."loans" to "postgres";

grant references on table "public"."loans" to "postgres";

grant select on table "public"."loans" to "postgres";

grant trigger on table "public"."loans" to "postgres";

grant truncate on table "public"."loans" to "postgres";

grant update on table "public"."loans" to "postgres";

grant delete on table "public"."loans" to "service_role";

grant insert on table "public"."loans" to "service_role";

grant references on table "public"."loans" to "service_role";

grant select on table "public"."loans" to "service_role";

grant trigger on table "public"."loans" to "service_role";

grant truncate on table "public"."loans" to "service_role";

grant update on table "public"."loans" to "service_role";



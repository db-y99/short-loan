create type "public"."activity_log_type" as enum ('message', 'system_event', 'image_upload', 'approval', 'contract_created', 'contract_signed', 'disbursement');

create type "public"."loan_status" as enum ('pending', 'approved', 'rejected', 'disbursed', 'completed');


  create table "public"."customers" (
    "id" uuid not null default gen_random_uuid(),
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
    "id" uuid not null default gen_random_uuid(),
    "loan_id" uuid not null,
    "type" public.activity_log_type not null,
    "user_id" text not null,
    "user_name" text not null,
    "timestamp" timestamp with time zone not null default now(),
    "content" text,
    "images" text[],
    "links" text[],
    "system_message" text,
    "mentions" text[],
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );



  create table "public"."loan_asset_images" (
    "id" uuid not null default gen_random_uuid(),
    "loan_id" uuid not null,
    "url" text not null,
    "position" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );



  create table "public"."loan_files" (
    "id" uuid not null default gen_random_uuid(),
    "loan_id" uuid not null,
    "name" text not null,
    "provider" text not null,
    "file_id" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );



  create table "public"."loan_references" (
    "id" uuid not null default gen_random_uuid(),
    "loan_id" uuid not null,
    "full_name" text not null,
    "phone" text not null,
    "relationship" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );



  create table "public"."loans" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "creator" text not null,
    "customer_id" uuid not null,
    "asset_type" text not null,
    "asset_name" text not null,
    "chassis_number" text,
    "engine_number" text,
    "imei" text,
    "serial" text,
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
    "is_signed" boolean not null default false,
    "original_file_url" text,
    "payment_schedule" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone,
    "approved_at" timestamp with time zone
      );


  create extension if not exists moddatetime schema extensions;

drop trigger if exists handle_updated_at on public.customers;

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
before update on public.loan_asset_images
for each row
execute procedure extensions.moddatetime(updated_at);



CREATE UNIQUE INDEX contract_activity_logs_pkey ON public.loan_activity_logs USING btree (id);

CREATE UNIQUE INDEX contract_asset_images_pkey ON public.loan_asset_images USING btree (id);

CREATE UNIQUE INDEX contract_files_pkey ON public.loan_files USING btree (id);

CREATE UNIQUE INDEX contract_references_pkey ON public.loan_references USING btree (id);

CREATE UNIQUE INDEX contracts_code_unique ON public.loans USING btree (code);

CREATE UNIQUE INDEX contracts_pkey ON public.loans USING btree (id);

CREATE UNIQUE INDEX customers_cccd_unique ON public.customers USING btree (cccd);

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE INDEX loan_activity_logs_loan_ts_idx ON public.loan_activity_logs USING btree (loan_id, "timestamp" DESC);

CREATE INDEX loan_activity_logs_loan_ts_old_idx ON public.loan_activity_logs USING btree (loan_id, "timestamp" DESC);

CREATE INDEX loan_asset_images_loan_id_idx ON public.loan_asset_images USING btree (loan_id);

CREATE INDEX loan_asset_images_loan_id_old_idx ON public.loan_asset_images USING btree (loan_id);

CREATE INDEX loan_files_loan_id_idx ON public.loan_files USING btree (loan_id);

CREATE INDEX loan_files_loan_id_old_idx ON public.loan_files USING btree (loan_id);

CREATE INDEX loan_references_loan_id_idx ON public.loan_references USING btree (loan_id);

CREATE INDEX loan_references_loan_id_old_idx ON public.loan_references USING btree (loan_id);

CREATE INDEX loans_created_at_idx ON public.loans USING btree (created_at DESC);

CREATE INDEX loans_customer_id_idx ON public.loans USING btree (customer_id);

CREATE INDEX loans_status_idx ON public.loans USING btree (status);

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."loan_activity_logs" add constraint "contract_activity_logs_pkey" PRIMARY KEY using index "contract_activity_logs_pkey";

alter table "public"."loan_asset_images" add constraint "contract_asset_images_pkey" PRIMARY KEY using index "contract_asset_images_pkey";

alter table "public"."loan_files" add constraint "contract_files_pkey" PRIMARY KEY using index "contract_files_pkey";

alter table "public"."loan_references" add constraint "contract_references_pkey" PRIMARY KEY using index "contract_references_pkey";

alter table "public"."loans" add constraint "contracts_pkey" PRIMARY KEY using index "contracts_pkey";

alter table "public"."customers" add constraint "customers_cccd_unique" UNIQUE using index "customers_cccd_unique";

alter table "public"."loan_activity_logs" add constraint "loan_activity_logs_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_activity_logs" validate constraint "loan_activity_logs_loan_id_fkey";

alter table "public"."loan_asset_images" add constraint "loan_asset_images_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_asset_images" validate constraint "loan_asset_images_loan_id_fkey";

alter table "public"."loan_files" add constraint "loan_files_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_files" validate constraint "loan_files_loan_id_fkey";

alter table "public"."loan_references" add constraint "loan_references_loan_id_fkey" FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE not valid;

alter table "public"."loan_references" validate constraint "loan_references_loan_id_fkey";

alter table "public"."loans" add constraint "contracts_code_unique" UNIQUE using index "contracts_code_unique";

alter table "public"."loans" add constraint "contracts_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT not valid;

alter table "public"."loans" validate constraint "contracts_customer_id_fkey";

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

grant delete on table "public"."loan_asset_images" to "anon";

grant insert on table "public"."loan_asset_images" to "anon";

grant references on table "public"."loan_asset_images" to "anon";

grant select on table "public"."loan_asset_images" to "anon";

grant trigger on table "public"."loan_asset_images" to "anon";

grant truncate on table "public"."loan_asset_images" to "anon";

grant update on table "public"."loan_asset_images" to "anon";

grant delete on table "public"."loan_asset_images" to "authenticated";

grant insert on table "public"."loan_asset_images" to "authenticated";

grant references on table "public"."loan_asset_images" to "authenticated";

grant select on table "public"."loan_asset_images" to "authenticated";

grant trigger on table "public"."loan_asset_images" to "authenticated";

grant truncate on table "public"."loan_asset_images" to "authenticated";

grant update on table "public"."loan_asset_images" to "authenticated";

grant delete on table "public"."loan_asset_images" to "postgres";

grant insert on table "public"."loan_asset_images" to "postgres";

grant references on table "public"."loan_asset_images" to "postgres";

grant select on table "public"."loan_asset_images" to "postgres";

grant trigger on table "public"."loan_asset_images" to "postgres";

grant truncate on table "public"."loan_asset_images" to "postgres";

grant update on table "public"."loan_asset_images" to "postgres";

grant delete on table "public"."loan_asset_images" to "service_role";

grant insert on table "public"."loan_asset_images" to "service_role";

grant references on table "public"."loan_asset_images" to "service_role";

grant select on table "public"."loan_asset_images" to "service_role";

grant trigger on table "public"."loan_asset_images" to "service_role";

grant truncate on table "public"."loan_asset_images" to "service_role";

grant update on table "public"."loan_asset_images" to "service_role";

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

grant delete on table "public"."loans" to "anon";

grant insert on table "public"."loans" to "anon";

grant references on table "public"."loans" to "anon";

grant select on table "public"."loans" to "anon";

grant trigger on table "public"."loans" to "anon";

grant truncate on table "public"."loans" to "anon";

grant update on table "public"."loans" to "anon";

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



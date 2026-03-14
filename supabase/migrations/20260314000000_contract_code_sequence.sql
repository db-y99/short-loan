-- Bảng lưu sequence cho mã hợp đồng (tương đương PropertiesService CONTRACT_SEQ)
-- Đảm bảo không trùng khi nhiều người tạo cùng lúc
create table if not exists "public"."app_sequences" (
  "key" text primary key,
  "value" bigint not null default 0,
  "updated_at" timestamp with time zone not null default now()
);

-- Khởi tạo sequence cho mã hợp đồng (bắt đầu từ 0, lần đầu gọi sẽ trả về 1)
insert into "public"."app_sequences" ("key", "value")
values ('CONTRACT_SEQ', 0)
on conflict ("key") do nothing;

-- Hàm atomic lấy số thứ tự tiếp theo (dùng trong generateLoanCodeService)
create or replace function "public"."get_next_contract_seq"()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_val integer;
begin
  update "public"."app_sequences"
  set "value" = "value" + 1,
      "updated_at" = now()
  where "key" = 'CONTRACT_SEQ'
  returning ("value")::integer into next_val;

  if next_val is null then
    insert into "public"."app_sequences" ("key", "value", "updated_at")
    values ('CONTRACT_SEQ', 1, now())
    returning ("value")::integer into next_val;
  end if;

  return next_val;
end;
$$;

comment on table "public"."app_sequences" is 'Key-value store for atomic sequences (e.g. CONTRACT_SEQ for contract code)';
comment on function "public"."get_next_contract_seq"() is 'Returns next contract sequence number (atomic, safe for concurrent calls)';

grant execute on function "public"."get_next_contract_seq"() to authenticated;
grant execute on function "public"."get_next_contract_seq"() to service_role;

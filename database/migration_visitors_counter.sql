-- ============================================================
--  visitors_counter - site visit counter (one row, 12 month columns)
--  Each month column holds a JSON array: ["Visitors 150"]
--  Counts every page load / reload, accumulated across all years.
-- ============================================================

create table if not exists public.visitors_counter (
  id         smallint primary key default 1,
  january    jsonb not null default '["Visitors 0"]'::jsonb,
  february   jsonb not null default '["Visitors 0"]'::jsonb,
  march      jsonb not null default '["Visitors 0"]'::jsonb,
  april      jsonb not null default '["Visitors 0"]'::jsonb,
  may        jsonb not null default '["Visitors 0"]'::jsonb,
  june       jsonb not null default '["Visitors 0"]'::jsonb,
  july       jsonb not null default '["Visitors 0"]'::jsonb,
  august     jsonb not null default '["Visitors 0"]'::jsonb,
  september  jsonb not null default '["Visitors 0"]'::jsonb,
  october    jsonb not null default '["Visitors 0"]'::jsonb,
  november   jsonb not null default '["Visitors 0"]'::jsonb,
  december   jsonb not null default '["Visitors 0"]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint visitors_counter_single_row check (id = 1)
);

comment on table public.visitors_counter is
  'Single-row website visit counter. One jsonb column per month, each holding ["Visitors N"]. Totals accumulate across years.';

-- Seed the single row
insert into public.visitors_counter (id) values (1) on conflict (id) do nothing;


-- ============================================================
--  RPC: increment_visitor_counter()
--  Called by the public website on every page load.
--  The month is decided SERVER-SIDE so the client cannot spoof it.
-- ============================================================
create or replace function public.increment_visitor_counter()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month   text;
  v_current jsonb;
  v_count   bigint;
begin
  -- Month name in the business timezone, e.g. 'july'
  v_month := lower(to_char(timezone('Asia/Riyadh', now()), 'FMMonth'));

  insert into public.visitors_counter (id) values (1) on conflict (id) do nothing;

  -- Lock the row so concurrent visits cannot lose an increment
  execute format(
    'select %I from public.visitors_counter where id = 1 for update', v_month
  ) into v_current;

  -- Pull the digits out of "Visitors N" and add one
  v_count := coalesce(
               nullif(regexp_replace(coalesce(v_current ->> 0, ''), '\D', '', 'g'), ''),
               '0'
             )::bigint + 1;

  execute format(
    'update public.visitors_counter set %I = $1, updated_at = now() where id = 1', v_month
  ) using jsonb_build_array('Visitors ' || v_count);

  return jsonb_build_object('month', v_month, 'count', v_count);
end;
$$;

comment on function public.increment_visitor_counter() is
  'Adds 1 to the current month column of visitors_counter and returns {month, count}.';


-- ============================================================
--  Permissions
--  Visitors may READ the counter and call the RPC, but may not
--  write to the table directly - only the SECURITY DEFINER
--  function can change the numbers.
-- ============================================================
alter table public.visitors_counter enable row level security;

drop policy if exists "visitors_counter_public_read" on public.visitors_counter;
create policy "visitors_counter_public_read"
  on public.visitors_counter
  for select
  to anon, authenticated
  using (true);

revoke all on table public.visitors_counter from anon, authenticated;
grant select on table public.visitors_counter to anon, authenticated;

revoke all on function public.increment_visitor_counter() from public;
grant execute on function public.increment_visitor_counter() to anon, authenticated;

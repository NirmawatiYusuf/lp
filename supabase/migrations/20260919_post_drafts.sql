-- Private editor snapshots. Apply after supabase/setup.sql.
create table if not exists post_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  snapshot jsonb not null,
  base_post_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists post_drafts_user_post_idx
  on post_drafts (user_id, post_id)
  where post_id is not null;
create unique index if not exists post_drafts_user_new_idx
  on post_drafts (user_id) where post_id is null;
create index if not exists post_drafts_user_updated_idx
  on post_drafts (user_id, updated_at desc);

alter table post_drafts enable row level security;
revoke all on post_drafts from anon, authenticated;
grant all on post_drafts to service_role;
drop policy if exists post_drafts_private on post_drafts;
create policy post_drafts_private on post_drafts
  for all to anon, authenticated
  using (false)
  with check (false);

create or replace function post_drafts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists post_drafts_set_updated_at on post_drafts;
create trigger post_drafts_set_updated_at before update on post_drafts
  for each row execute function post_drafts_set_updated_at();

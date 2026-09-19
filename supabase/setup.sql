create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  problem text,
  approach text,
  outcome text,
  role text,
  period text,
  tech_stack text[] not null default '{}',
  repo_url text,
  demo_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();

create table site_settings (
  id smallint primary key default 1 check (id = 1),
  public_email text,
  github_url text,
  linkedin_url text,
  about_bio text,
  education text,
  focus_interests text,
  profile_photo_url text,
  cv_url text,
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1);
create trigger site_settings_set_updated_at before update on site_settings
  for each row execute function set_updated_at();

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  body text,
  topics text[] not null default '{}',
  course_slug text,
  week_number int,
  project_id uuid references projects(id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  cover_image_url text,
  views int not null default 0,
  created_at timestamptz not null default now(),
  sort_at timestamptz generated always as (coalesce(published_at, created_at)) stored,
  updated_at timestamptz not null default now(),
  constraint posts_week_range check (week_number is null or week_number between 1 and 16),
  constraint posts_course_week_together check ((course_slug is null) = (week_number is null))
);
create unique index posts_course_week_uniq on posts (course_slug, week_number)
  where course_slug is not null and week_number is not null;
create index posts_project_id_idx on posts (project_id) where project_id is not null;
create trigger posts_set_updated_at before update on posts
  for each row execute function set_updated_at();

create table post_files (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index post_files_post_id_idx on post_files (post_id);
create unique index post_files_one_pdf_per_post on post_files (post_id)
  where file_type = 'pdf';

create table project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_path text not null,
  file_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_id_idx on project_images (project_id);

alter table projects enable row level security;
alter table posts enable row level security;
alter table post_files enable row level security;
alter table project_images enable row level security;
alter table site_settings enable row level security;

revoke insert, update, delete on projects, posts, post_files, project_images, site_settings
  from anon, authenticated;
grant select on projects, posts, post_files, project_images, site_settings
  to anon, authenticated;

create policy projects_read_published on projects for select using (published = true);
create policy posts_read_published on posts for select using (published = true);
create policy post_files_read_published on post_files for select using (
  exists (select 1 from posts p where p.id = post_files.post_id and p.published)
);
create policy project_images_read_published on project_images for select using (
  exists (select 1 from projects p where p.id = project_images.project_id and p.published)
);
create policy site_settings_read_public on site_settings for select using (id = 1);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-files', 'note-files', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function increment_post_views(post_id uuid)
returns void language sql security definer set search_path = public as $$
  update posts set views = views + 1 where id = post_id and published = true;
$$;
revoke all on function increment_post_views(uuid) from public, anon, authenticated;
grant execute on function increment_post_views(uuid) to service_role;

-- Private autosave snapshots never participate in public content reads.
create table post_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  snapshot jsonb not null,
  base_post_updated_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index post_drafts_user_post_idx on post_drafts (user_id, post_id) where post_id is not null;
create unique index post_drafts_user_new_idx on post_drafts (user_id) where post_id is null;
create index post_drafts_user_updated_idx on post_drafts (user_id, updated_at desc);
alter table post_drafts enable row level security;
revoke all on post_drafts from anon, authenticated;
grant all on post_drafts to service_role;
create policy post_drafts_private on post_drafts for all to anon, authenticated using (false) with check (false);
create trigger post_drafts_set_updated_at before update on post_drafts
  for each row execute function set_updated_at();

alter table site_settings
  add column if not exists about_bio text,
  add column if not exists education text,
  add column if not exists focus_interests text,
  add column if not exists profile_photo_url text,
  add column if not exists cv_url text;

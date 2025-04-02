create table public.users (
  id uuid not null,
  first_name text null,
  last_name text null,
  email text null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.tasks (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  description text not null,
  is_completed boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint tasks_pkey primary key (id),
  constraint tasks_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.sleep_entries (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default gen_random_uuid (),
  entry_date date not null,
  start time without time zone null,
  "end" time without time zone null,
  quality smallint null,
  constraint sleep_entries_pkey primary key (id),
  constraint sleep_entries_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint sleep_entries_quality_check check (
    (
      (quality > 0)
      and (quality <= 5)
    )
  )
) TABLESPACE pg_default;

create table public.responses (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default gen_random_uuid (),
  scale_rating smallint not null,
  attribute_ids uuid[] null,
  entry_date date not null default CURRENT_DATE,
  water smallint null,
  study_hours smallint null,
  work_hours smallint null,
  work_rating smallint null,
  study_rating smallint null,
  constraint responses_pkey primary key (id),
  constraint responses_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint responses_study_check check ((study_hours >= 0)),
  constraint responses_water_check check ((water >= 0)),
  constraint responses_work_hours_check check (
    (
      (work_hours >= 0)
      and (work_hours < 48)
    )
  ),
  constraint responses_work_rating_check check ((work_rating > 0))
) TABLESPACE pg_default;

create table public.reminders (
  id bigint generated by default as identity not null,
  user_id uuid not null,
  reminder_time time without time zone not null default '09:00:00'::time without time zone,
  journal_reminders boolean not null default false,
  data_intake_reminders boolean not null default false,
  activity_reminders boolean not null default false,
  constraint reminder_pkey primary key (id),
  constraint reminders_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.personalized_categories (
  id uuid not null default gen_random_uuid (),
  name character varying not null,
  constraint personalized_categories_pkey primary key (id)
) TABLESPACE pg_default;

create table public.journal_entries (
  user_id uuid not null default auth.uid (),
  journal_text character varying not null default ''::character varying,
  entry_date date not null default CURRENT_TIMESTAMP,
  id bigint generated by default as identity not null,
  constraint journal_entries_pkey primary key (id),
  constraint journal_entries_id_key unique (id),
  constraint journal_entries_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint journal_entries_id_check check ((id > 0))
) TABLESPACE pg_default;

create table public.categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  constraint categories_pkey primary key (id),
  constraint categories_name_key unique (name)
) TABLESPACE pg_default;

create table public.attributes (
  id uuid not null default gen_random_uuid (),
  category_id uuid not null default gen_random_uuid (),
  name text not null,
  constraint attributes_pkey primary key (id),
  constraint attributes_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.added_habit_responses (
  id uuid not null default gen_random_uuid (),
  habit uuid null default gen_random_uuid (),
  entry_date date not null,
  tracking_method json null,
  user_id uuid null,
  constraint added_habit_responses_pkey primary key (id),
  constraint added_habit_responses_habit_fkey foreign KEY (habit) references personalized_categories (id),
  constraint added_habit_responses_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.added_habit (
  user_id uuid not null default auth.uid (),
  added_habit uuid null,
  tracking_method character varying[] null,
  id uuid not null default gen_random_uuid (),
  constraint added_habit_pkey primary key (id),
  constraint added_habit_id_key unique (id),
  constraint added_habit_added_habit_fkey foreign KEY (added_habit) references personalized_categories (id),
  constraint added_habit_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;
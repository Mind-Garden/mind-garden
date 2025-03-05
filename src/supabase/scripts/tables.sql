create table users (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text
);
-- Set up Row Level Security (RLS)
alter table users
  enable row level security;

create policy "Profiles are viewable by self." on users 
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on users 
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on users 
  for update using (auth.uid() = id);

create policy "Users can delete own profile." on users 
  for delete using (auth.uid() = id);

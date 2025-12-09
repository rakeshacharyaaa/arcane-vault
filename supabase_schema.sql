-- Run this in your Supabase SQL Editor

-- 1. Create Table with user_id
create table public.pages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null, -- Links page to a user
  title text not null default 'Untitled',
  icon text,
  cover_image text,
  content jsonb default '{"type": "doc", "content": []}',
  tags text[] default array[]::text[],
  parent_id uuid references public.pages(id) on delete cascade,
  is_expanded boolean default false,
  created_at bigint default (extract(epoch from now()) * 1000),
  updated_at bigint default (extract(epoch from now()) * 1000)
);

-- 2. Enable Realtime
alter publication supabase_realtime add table public.pages;

-- 3. Enable Row Level Security (RLS)
alter table public.pages enable row level security;

-- 4. Create Policies
-- Policy: Users can view their own pages
create policy "Users can view their own pages"
on public.pages for select
using (auth.uid() = user_id);

-- Policy: Users can insert their own pages
create policy "Users can insert their own pages"
on public.pages for insert
with check (auth.uid() = user_id);

-- Policy: Users can update their own pages
create policy "Users can update their own pages"
on public.pages for update
using (auth.uid() = user_id);

-- Policy: Users can delete their own pages
create policy "Users can delete their own pages"
on public.pages for delete
using (auth.uid() = user_id);

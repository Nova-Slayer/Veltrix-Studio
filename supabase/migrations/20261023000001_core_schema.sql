-- Veltrix Studio core schema. All timestamps UTC. RLS on every table.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text,
  theme text not null default 'dark' check (theme in ('dark','light','system')),
  notify_email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 2000),
  notes text check (char_length(notes) <= 20000),
  status text not null default 'planning' check (status in ('planning','active','on_hold','completed')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  color text not null default '#8B5CF6' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)  -- enables composite FK so tasks can't point at another user's project
);
create index projects_user_status_idx on public.projects (user_id, status);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 5000),
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_project_idx on public.tasks (project_id);

create or replace function public.tasks_set_completed() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then new.completed_at = now();
  elsif new.status <> 'done' then new.completed_at = null; end if;
  return new;
end $$;
create trigger tasks_completed before insert or update on public.tasks
  for each row execute function public.tasks_set_completed();

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 200),
  url text check (url is null or (url ~* '^https?://' and char_length(url) <= 2048)),
  description text check (char_length(description) <= 2000),
  category text not null default 'link'
    check (category in ('link','documentation','tutorial','tool','design','note')),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resources_user_idx on public.resources (user_id, category);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  entity_type text not null check (entity_type in ('project','task','resource')),
  entity_id uuid not null,
  action text not null check (action in ('created','updated','deleted','completed')),
  created_at timestamptz not null default now()
);
create index activity_user_created_idx on public.activity_logs (user_id, created_at desc);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider_customer_id text,
  provider_subscription_id text,
  plan text not null default 'free' check (plan in ('free','pro')),
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['profiles','projects','tasks','resources','subscriptions'] loop
    execute format('create trigger %I_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop; end $$;

-- New user bootstrap: profile + free subscription row
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email,'@',1));
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Server-enforced plan limit: free users may have at most 3 non-completed projects
create or replace function public.enforce_project_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare cur_plan text; active_count int;
begin
  select plan into cur_plan from public.subscriptions where user_id = new.user_id;
  if coalesce(cur_plan,'free') = 'free' and new.status <> 'completed' then
    select count(*) into active_count from public.projects
      where user_id = new.user_id and status <> 'completed' and id <> new.id;
    if active_count >= 3 then
      raise exception 'PLAN_LIMIT: Free plan allows up to 3 active projects' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger projects_limit before insert or update of status on public.projects
  for each row execute function public.enforce_project_limit();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;
alter table public.activity_logs enable row level security;
alter table public.subscriptions enable row level security;

create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$ declare t text; begin
  foreach t in array array['projects','tasks','resources'] loop
    execute format('create policy %I_select on public.%I for select to authenticated using (user_id = (select auth.uid()))', t, t);
    execute format('create policy %I_insert on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t, t);
    execute format('create policy %I_update on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t, t);
    execute format('create policy %I_delete on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t, t);
  end loop; end $$;

create policy activity_select on public.activity_logs for select to authenticated using (user_id = (select auth.uid()));
create policy activity_insert on public.activity_logs for insert to authenticated with check (user_id = (select auth.uid()));

-- Subscriptions: read-only for users; writes only via service role (Stripe webhook Edge Function)
create policy subs_select on public.subscriptions for select to authenticated using (user_id = (select auth.uid()));

-- Trigger-only functions must not be callable through the REST API
revoke execute on function public.enforce_project_limit() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

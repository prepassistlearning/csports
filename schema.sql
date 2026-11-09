-- CopaPub schema: run once in Supabase > SQL Editor
create table if not exists profiles(id uuid primary key references auth.users on delete cascade, name text, created_at timestamptz default now());
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,name) values(new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1))); return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create table if not exists tournaments(
 id uuid primary key default gen_random_uuid(),
 owner uuid not null default auth.uid() references auth.users on delete cascade,
 name text not null, sport text default 'Football', icon text default '🏆',
 format text not null check(format in('league','cup','hybrid')),
 settings jsonb default '{}', start_date date, created_at timestamptz default now());
create table if not exists teams(
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references tournaments on delete cascade,
 name text not null, short text, color text default '#0A84FF', grp text);
create table if not exists matches(
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references tournaments on delete cascade,
 stage text not null, round int default 1, slot int default 0, grp text,
 home uuid references teams on delete set null, away uuid references teams on delete set null,
 hs int default 0, aws int default 0, hp int, ap int,
 status text default 'upcoming', events jsonb default '[]', played_at timestamptz);
create index if not exists t_owner on tournaments(owner);
create index if not exists teams_t on teams(tournament_id);
create index if not exists matches_t on matches(tournament_id);

alter table profiles enable row level security;
alter table tournaments enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;

create policy "own profile read" on profiles for select using(auth.uid()=id);
create policy "own profile edit" on profiles for update using(auth.uid()=id);
-- Anyone holding the link (uuid) can READ. Only the owner can WRITE.
create policy "t read" on tournaments for select using(true);
create policy "t insert" on tournaments for insert with check(owner=auth.uid());
create policy "t update" on tournaments for update using(owner=auth.uid());
create policy "t delete" on tournaments for delete using(owner=auth.uid());
create policy "teams read" on teams for select using(true);
create policy "teams write" on teams for all using(exists(select 1 from tournaments t where t.id=tournament_id and t.owner=auth.uid())) with check(exists(select 1 from tournaments t where t.id=tournament_id and t.owner=auth.uid()));
create policy "matches read" on matches for select using(true);
create policy "matches write" on matches for all using(exists(select 1 from tournaments t where t.id=tournament_id and t.owner=auth.uid())) with check(exists(select 1 from tournaments t where t.id=tournament_id and t.owner=auth.uid()));

alter publication supabase_realtime add table matches, teams;

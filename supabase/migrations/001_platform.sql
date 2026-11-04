-- Apply to a dedicated STAGING project first. No demo seed and no destructive DROP.
begin;
create table if not exists public.te_state (
 id boolean primary key default true check(id), revision bigint not null default 0,
 records jsonb not null default '[]' check(jsonb_typeof(records)='array'), updated_at timestamptz not null default now()
);
insert into public.te_state(id) values(true) on conflict do nothing;
create table if not exists public.te_sessions (
 token_hash text primary key, user_id uuid not null references auth.users(id) on delete cascade,
 expires_at timestamptz not null, created_at timestamptz not null default now()
);
create index if not exists te_sessions_expiry on public.te_sessions(expires_at);
create table if not exists public.te_limits (key text primary key, hits integer not null, reset_at timestamptz not null);
create table if not exists public.te_media (
 id uuid primary key, state text not null check(state in ('pending','ready','retired')),
 created_at timestamptz not null default now(), created_by uuid not null references auth.users(id), width integer, height integer
);
create table if not exists public.te_snapshots (
 id uuid primary key default gen_random_uuid(), revision bigint not null,
 records jsonb not null check(jsonb_typeof(records)='array'), created_at timestamptz not null default now(), actor uuid not null
);
create table if not exists public.te_audit (
 id bigint generated always as identity primary key, actor uuid, action text not null,
 target text, created_at timestamptz not null default now()
);
create table if not exists public.te_leads (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 150),
 contact text not null check(length(contact) between 1 and 200), message text not null check(length(message) between 1 and 3000),
 property_id text, status text not null default 'new' check(status in ('new','reviewing','contacted','completed')),
 note text not null default '' check(length(note)<=5000), revision bigint not null default 0,
 privacy_version text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- No anonymous/authenticated table grants or permissive policies. All app access passes server authorization.
alter table public.te_state enable row level security;
alter table public.te_sessions enable row level security;
alter table public.te_limits enable row level security;
alter table public.te_media enable row level security;
alter table public.te_snapshots enable row level security;
alter table public.te_audit enable row level security;
alter table public.te_leads enable row level security;
revoke all on public.te_state,public.te_sessions,public.te_limits,public.te_media,public.te_snapshots,public.te_audit,public.te_leads from anon,authenticated;
grant all on public.te_state,public.te_sessions,public.te_limits,public.te_media,public.te_snapshots,public.te_audit,public.te_leads to service_role;
grant usage,select on sequence public.te_audit_id_seq to service_role;

create or replace function public.te_rate(p_key text,p_max integer,p_seconds integer) returns boolean
language plpgsql set search_path=public as $$
declare n integer;
begin
 delete from te_limits where reset_at<now()-interval '1 day';
 insert into te_limits values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set hits=case when te_limits.reset_at<=now() then 1 else te_limits.hits+1 end,
 reset_at=case when te_limits.reset_at<=now() then now()+make_interval(secs=>p_seconds) else te_limits.reset_at end returning hits into n;
 return n<=p_max;
end $$;

create or replace function public.te_change(p_revision bigint,p_records jsonb,p_actor uuid,p_action text default 'portfolio.save') returns jsonb
language plpgsql set search_path=public as $$
declare current_state te_state%rowtype; next_records jsonb; r jsonb; previous jsonb;
begin
 perform pg_advisory_xact_lock(7463501);
 select * into current_state from te_state where id=true for update;
 if current_state.revision<>p_revision then raise exception 'revision_conflict' using errcode='P0001'; end if;
 if p_action not in ('portfolio.save','portfolio.restore') then raise exception 'invalid_action'; end if;
 if jsonb_typeof(p_records)<>'array' or jsonb_array_length(p_records)>1000 then raise exception 'invalid_records'; end if;
 if (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(p_records) x) then raise exception 'duplicate_id'; end if;
 -- Removing an entry is disallowed; callers archive it, retaining ID and historical references.
 if exists(select 1 from jsonb_array_elements(current_state.records) old where not exists(select 1 from jsonb_array_elements(p_records) new where new->>'id'=old->>'id')) then raise exception 'archive_required'; end if;
 if exists(select 1 from jsonb_array_elements(p_records) x cross join lateral jsonb_array_elements(x->'photos') p
  where not exists(select 1 from te_media m where m.id::text=p->>'key' and m.state='ready')) then raise exception 'media_missing'; end if;
 next_records='[]';
 for r in select * from jsonb_array_elements(p_records) loop
  select x into previous from jsonb_array_elements(current_state.records) x where x->>'id'=r->>'id';
  r = (r-'updatedAt'-'publishedAt') || jsonb_build_object('updatedAt',now(),'publishedAt',
   case when r->>'status' in ('published','sold') then coalesce(nullif(previous->'publishedAt','null'::jsonb),to_jsonb(now())) else previous->'publishedAt' end);
  next_records=next_records||jsonb_build_array(r);
 end loop;
 insert into te_snapshots(revision,records,actor) values(current_state.revision,current_state.records,p_actor);
 update te_state set records=next_records,revision=revision+1,updated_at=now() where id=true;
 insert into te_audit(actor,action,target) values(p_actor,p_action,(current_state.revision+1)::text);
 return jsonb_build_object('records',next_records,'revision',current_state.revision+1);
end $$;

create or replace function public.te_retire_media(p_id uuid,p_actor uuid) returns boolean
language plpgsql set search_path=public as $$
begin
 perform pg_advisory_xact_lock(7463501);
 if exists(select 1 from te_state s cross join lateral jsonb_array_elements(s.records) r cross join lateral jsonb_array_elements(r->'photos') p where p->>'key'=p_id::text)
 or exists(select 1 from te_snapshots s cross join lateral jsonb_array_elements(s.records) r cross join lateral jsonb_array_elements(r->'photos') p where p->>'key'=p_id::text) then raise exception 'media_referenced'; end if;
 update te_media set state='retired' where id=p_id;
 insert into te_audit(actor,action,target) values(p_actor,'media.retire',p_id::text);
 return true;
end $$;

create or replace function public.te_update_lead(p_id uuid,p_revision bigint,p_status text,p_note text,p_actor uuid) returns jsonb
language plpgsql set search_path=public as $$
declare result te_leads%rowtype;
begin
 update te_leads set status=p_status,note=p_note,revision=revision+1,updated_at=now() where id=p_id and revision=p_revision returning * into result;
 if result.id is null then raise exception 'revision_conflict'; end if;
 insert into te_audit(actor,action,target) values(p_actor,'lead.update',p_id::text);
 return to_jsonb(result);
end $$;
revoke all on function public.te_rate(text,integer,integer),public.te_change(bigint,jsonb,uuid,text),public.te_retire_media(uuid,uuid),public.te_update_lead(uuid,bigint,text,text,uuid) from public,anon,authenticated;
grant execute on function public.te_rate(text,integer,integer),public.te_change(bigint,jsonb,uuid,text),public.te_retire_media(uuid,uuid),public.te_update_lead(uuid,bigint,text,text,uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('te-photos','te-photos',false,4194304,array['image/webp']) on conflict(id) do nothing;
commit;

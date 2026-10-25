-- Autrement vu : schéma initial.
-- Les contenus sont éditables depuis le Studio Supabase (Table Editor), sans coder.
-- Le public lit les contenus publiés ; il ne peut qu'insérer des messages de contact
-- et des événements de mesure anonymes (aucune lecture côté public).

create table public.conditions (
  slug                  text primary key,
  rank                  smallint not null unique,
  name                  text not null,
  prevalence            text not null,
  prevalence_unverified boolean not null default false,
  scale_label           text not null,
  stages_summary        text not null,
  intro                 text not null,
  scene_title           text not null,
  scene_description     text not null,
  vision_warning        text not null,
  vision_kind           text check (vision_kind in ('auditive', 'moteur', 'visuelle', 'autisme')),
  invisible             boolean not null default false,
  published             boolean not null default true,
  updated_at            timestamptz not null default now()
);
comment on column public.conditions.vision_kind is
  'Scène Vision 3D disponible. NULL = « Vision 3D · bientôt ».';

create table public.stages (
  id             bigint generated always as identity primary key,
  condition_slug text not null references public.conditions (slug) on update cascade on delete cascade,
  position       smallint not null,
  label          text not null,
  description    text not null,
  thoughts       text[] not null default '{}',
  intensity      real not null default 0 check (intensity between 0 and 1),
  unique (condition_slug, position)
);
comment on column public.stages.intensity is
  'Intensité de la simulation Vision 3D, de 0 (léger) à 1 (maximal).';

create table public.gestures (
  id             bigint generated always as identity primary key,
  condition_slug text not null references public.conditions (slug) on update cascade on delete cascade,
  position       smallint not null,
  kind           text not null check (kind in ('aider', 'eviter', 'amenager')),
  title          text not null,
  body           text not null,
  unique (condition_slug, position)
);

create table public.testimonies (
  id             bigint generated always as identity primary key,
  condition_slug text not null references public.conditions (slug) on update cascade on delete cascade,
  witness_name   text not null,
  witness_age    smallint,
  is_pseudonym   boolean not null default true,
  is_example     boolean not null default false,
  portrait_url   text,
  media_url      text,
  media_kind     text check (media_kind in ('video', 'audio')),
  captions_url   text,
  quote          text not null,
  transcript     text not null,
  day_story      text[] not null default '{}',
  published      boolean not null default false,
  updated_at     timestamptz not null default now()
);
comment on column public.testimonies.is_example is
  'Texte d''exemple (ton) à réécrire avec le témoin avant publication.';
comment on column public.testimonies.day_story is
  'Journée type : une entrée par moment, format « 8 h · ... ».';

create table public.quiz_questions (
  id             bigint generated always as identity primary key,
  position       smallint not null unique,
  statement      text not null,
  is_true        boolean not null,
  explanation    text not null,
  condition_slug text references public.conditions (slug) on update cascade on delete set null,
  published      boolean not null default true
);

create table public.contact_messages (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind       text not null check (kind in ('reaction', 'temoignage', 'question')),
  name       text check (char_length(name) <= 120),
  email      text not null check (char_length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message    text not null check (char_length(message) between 10 and 5000),
  consent    boolean not null check (consent)
);

-- Mesure d'audience sans traceur : identifiant de session aléatoire, non persistant,
-- aucune IP ni user-agent stockés.
create table public.events (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  session_id     uuid not null,
  event          text not null check (event in (
                   'page_view', 'testimony_complete', 'vision3d_open', 'head_open',
                   'action_click', 'quiz_complete', 'share')),
  condition_slug text check (char_length(condition_slug) <= 64)
);

create index stages_condition_idx on public.stages (condition_slug, position);
create index gestures_condition_idx on public.gestures (condition_slug, position);
create index testimonies_condition_idx on public.testimonies (condition_slug);
create index quiz_condition_idx on public.quiz_questions (condition_slug);
create index events_event_idx on public.events (event, created_at);

alter table public.conditions       enable row level security;
alter table public.stages           enable row level security;
alter table public.gestures         enable row level security;
alter table public.testimonies      enable row level security;
alter table public.quiz_questions   enable row level security;
alter table public.contact_messages enable row level security;
alter table public.events           enable row level security;

create policy "Lecture publique des fiches publiées" on public.conditions
  for select to anon, authenticated using (published);

create policy "Lecture publique des stades" on public.stages
  for select to anon, authenticated using (
    exists (select 1 from public.conditions c where c.slug = condition_slug and c.published));

create policy "Lecture publique des gestes" on public.gestures
  for select to anon, authenticated using (
    exists (select 1 from public.conditions c where c.slug = condition_slug and c.published));

create policy "Lecture publique des témoignages publiés" on public.testimonies
  for select to anon, authenticated using (published);

create policy "Lecture publique du quiz" on public.quiz_questions
  for select to anon, authenticated using (published);

create policy "Envoi d'un message de contact" on public.contact_messages
  for insert to anon, authenticated with check (true);

create policy "Envoi d'un événement anonyme" on public.events
  for insert to anon, authenticated with check (true);

-- Le public n'a besoin que de ces droits.
revoke all on public.contact_messages, public.events from anon, authenticated;
grant insert on public.contact_messages, public.events to anon, authenticated;

-- Indicateurs du PRD (section 3), à interroger depuis le Studio (SQL Editor).
create view public.kpi_summary with (security_invoker = true) as
with sessions as (select count(distinct session_id)::numeric as n from public.events)
select
  e.event,
  count(*)                                   as total,
  count(distinct e.session_id)               as sessions,
  round(100 * count(distinct e.session_id) / nullif((select n from sessions), 0), 1) as pct_sessions
from public.events e
group by e.event;
revoke all on public.kpi_summary from anon, authenticated;

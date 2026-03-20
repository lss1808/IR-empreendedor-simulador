-- ══════════════════════════════════════════════
-- IR Empreendedor — Schema Supabase / PostgreSQL
-- Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════

-- Extensão para UUIDs automáticos
create extension if not exists "pgcrypto";

-- ── PERFIS DE USUÁRIO ──────────────────────────
-- Espelha auth.users do Supabase (criado automaticamente no login)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text,
  email       text unique not null,
  avatar_url  text,
  provider    text default 'email',   -- 'email' | 'google'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trigger: cria perfil automaticamente quando usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nome, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── NOTAS FISCAIS ──────────────────────────────
create table if not exists public.notas_fiscais (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  tipo         text not null check (tipo in ('nfse','nfe','fatura','recibo','orcamento')),
  numero       text,
  cliente_nome text,
  total        numeric(12,2) default 0,
  moeda        text default 'BRL',
  dados        jsonb not null default '{}',   -- todos os campos da nota
  itens        jsonb not null default '[]',   -- array de itens
  imagens      jsonb default '[]',            -- URLs de imagens anexadas
  status       text default 'emitida' check (status in ('emitida','paga','cancelada','pendente')),
  emitida_em   date,
  vence_em     date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── TEMPLATES DE LAYOUT ────────────────────────
create table if not exists public.templates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  nome        text not null default 'Meu template',
  is_default  boolean default false,
  layout      jsonb not null default '{}',   -- posição dos blocos, tema, cores, fontes
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Garante que cada usuário tenha no máx. 1 template padrão
create unique index if not exists templates_user_default
  on public.templates (user_id)
  where (is_default = true);

-- ── SIMULAÇÕES DE IR ───────────────────────────
create table if not exists public.ir_simulacoes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  ano_base     int not null default 2024,
  dados_input  jsonb not null default '{}',   -- respostas do wizard
  resultado    jsonb not null default '{}',   -- cálculos gerados
  created_at   timestamptz default now()
);

-- ── ROW LEVEL SECURITY (proteção por usuário) ──
-- Cada usuário vê e edita APENAS seus próprios dados

alter table public.profiles       enable row level security;
alter table public.notas_fiscais  enable row level security;
alter table public.templates      enable row level security;
alter table public.ir_simulacoes  enable row level security;

-- profiles
create policy "Usuário vê seu próprio perfil"
  on public.profiles for select using (auth.uid() = id);
create policy "Usuário edita seu próprio perfil"
  on public.profiles for update using (auth.uid() = id);

-- notas_fiscais
create policy "Usuário vê suas notas"
  on public.notas_fiscais for select using (auth.uid() = user_id);
create policy "Usuário cria suas notas"
  on public.notas_fiscais for insert with check (auth.uid() = user_id);
create policy "Usuário edita suas notas"
  on public.notas_fiscais for update using (auth.uid() = user_id);
create policy "Usuário deleta suas notas"
  on public.notas_fiscais for delete using (auth.uid() = user_id);

-- templates
create policy "Usuário vê seus templates"
  on public.templates for select using (auth.uid() = user_id);
create policy "Usuário cria seus templates"
  on public.templates for insert with check (auth.uid() = user_id);
create policy "Usuário edita seus templates"
  on public.templates for update using (auth.uid() = user_id);
create policy "Usuário deleta seus templates"
  on public.templates for delete using (auth.uid() = user_id);

-- ir_simulacoes
create policy "Usuário vê suas simulações"
  on public.ir_simulacoes for select using (auth.uid() = user_id);
create policy "Usuário cria suas simulações"
  on public.ir_simulacoes for insert with check (auth.uid() = user_id);
create policy "Usuário deleta suas simulações"
  on public.ir_simulacoes for delete using (auth.uid() = user_id);

-- ── STORAGE BUCKET ────────────────────────────
-- Crie no painel Supabase → Storage → New bucket → "nota-imagens" (public: false)
-- Ou rode este SQL (requer extensão storage):
-- insert into storage.buckets (id, name, public) values ('nota-imagens', 'nota-imagens', false);

-- Policy de storage: usuário acessa apenas sua pasta
-- (crie no painel Storage → Policies ou cole abaixo)
/*
create policy "Upload próprio"
  on storage.objects for insert
  with check (bucket_id = 'nota-imagens' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Leitura própria"
  on storage.objects for select
  using (bucket_id = 'nota-imagens' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Delete próprio"
  on storage.objects for delete
  using (bucket_id = 'nota-imagens' and auth.uid()::text = (storage.foldername(name))[1]);
*/

-- ── ÍNDICES ────────────────────────────────────
create index if not exists idx_notas_user    on public.notas_fiscais (user_id, created_at desc);
create index if not exists idx_notas_status  on public.notas_fiscais (user_id, status);
create index if not exists idx_templates_user on public.templates (user_id);
create index if not exists idx_ir_user       on public.ir_simulacoes (user_id, created_at desc);

-- ── FUNÇÃO updated_at automático ──────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_updated_at_notas    before update on public.notas_fiscais  for each row execute procedure public.set_updated_at();
create trigger set_updated_at_templates before update on public.templates       for each row execute procedure public.set_updated_at();
create trigger set_updated_at_profiles  before update on public.profiles        for each row execute procedure public.set_updated_at();

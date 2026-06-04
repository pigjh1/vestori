-- =============================================
-- Vestori — Supabase Schema
-- Supabase 대시보드 > SQL Editor에 붙여넣고 실행하세요
-- =============================================

-- entries 테이블
create table public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  text        text not null check (char_length(text) <= 500),
  mood        text not null check (mood in ('✦', '♡', '◎', '☁', '✿')),
  liked       boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 인덱스: 사용자별 최신순 조회
create index entries_user_created on public.entries (user_id, created_at desc);

-- RLS(Row Level Security) 활성화
alter table public.entries enable row level security;

-- 본인 데이터만 읽기
create policy "본인 기록 읽기"
  on public.entries for select
  using (auth.uid() = user_id);

-- 본인 데이터만 쓰기
create policy "본인 기록 추가"
  on public.entries for insert
  with check (auth.uid() = user_id);

-- 본인 데이터만 수정
create policy "본인 기록 수정"
  on public.entries for update
  using (auth.uid() = user_id);

-- 본인 데이터만 삭제
create policy "본인 기록 삭제"
  on public.entries for delete
  using (auth.uid() = user_id);

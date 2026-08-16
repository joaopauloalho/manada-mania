alter table public.questions
  add column if not exists review_status text not null default 'pending',
  add column if not exists reviewed_at timestamptz;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
revoke all on private.app_settings from public, anon, authenticated;

-- The question_admin_code value is intentionally provisioned outside Git.

create or replace function public.get_question_review_queue(p_code text)
returns table (
  id uuid,
  category_id text,
  text text,
  active boolean,
  review_status text,
  created_at timestamptz,
  reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if not exists (
    select 1 from private.app_settings s
    where s.key = 'question_admin_code' and s.value = p_code
  ) then
    raise exception 'Código de curadoria inválido' using errcode = '42501';
  end if;

  return query
    select q.id, q.category_id, q.text, q.active, q.review_status, q.created_at, q.reviewed_at
    from public.questions q
    order by
      case q.review_status when 'pending' then 0 when 'approved' then 1 else 2 end,
      q.category_id,
      q.created_at,
      q.id;
end;
$$;

create or replace function public.review_question(p_code text, p_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  result_row public.questions%rowtype;
begin
  if not exists (
    select 1 from private.app_settings s
    where s.key = 'question_admin_code' and s.value = p_code
  ) then
    raise exception 'Código de curadoria inválido' using errcode = '42501';
  end if;

  if p_action = 'approve' then
    update public.questions set active = true, review_status = 'approved', reviewed_at = now()
      where id = p_id returning * into result_row;
  elsif p_action = 'reject' then
    update public.questions set active = false, review_status = 'rejected', reviewed_at = now()
      where id = p_id returning * into result_row;
  elsif p_action = 'pending' then
    update public.questions set active = true, review_status = 'pending', reviewed_at = null
      where id = p_id returning * into result_row;
  elsif p_action = 'delete' then
    delete from public.questions where id = p_id returning * into result_row;
  else
    raise exception 'Ação inválida: %', p_action using errcode = '22023';
  end if;

  if result_row.id is null then
    raise exception 'Pergunta não encontrada' using errcode = 'P0002';
  end if;

  return to_jsonb(result_row);
end;
$$;

revoke all on function public.get_question_review_queue(text) from public;
grant execute on function public.get_question_review_queue(text) to anon, authenticated;
revoke all on function public.review_question(text, uuid, text) from public;
grant execute on function public.review_question(text, uuid, text) to anon, authenticated;

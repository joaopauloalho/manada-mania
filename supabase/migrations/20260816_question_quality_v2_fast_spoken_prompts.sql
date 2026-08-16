-- Question quality pass v2
-- Goal: keep 500 active questions optimized for spoken, reflex-style play.
-- Criteria applied to every prompt:
-- 1) answerable naturally in 1-3 words;
-- 2) immediately understandable;
-- 3) high chance of answer convergence;
-- 4) no trivia dependency;
-- 5) avoid long/open hypothetical storytelling;
-- 6) rewritten prompts stay short (<= 60 characters).

begin;

with replacements(category_id, texts) as (
  values
  ('geral', array[
    'Fale uma coisa que tem em toda cozinha.',
    'Fale algo que você usa antes de dormir.',
    'Fale uma coisa que sempre fica na tomada.',
    'Fale algo que você guarda na carteira.',
    'Fale uma coisa que tem em todo banheiro.',
    'Fale algo que você usa quando chove.',
    'Fale uma coisa que fica perto da cama.',
    'Fale algo que você compra toda semana.'
  ]::text[]),
  ('comida', array[
    'Fale uma comida com um buraco no meio.',
    'Fale uma comida amarela.',
    'Fale uma coisa que você passa no pão.'
  ]::text[]),
  ('brasil', array[
    'Fale uma cidade brasileira sem praia.',
    'Fale uma coisa que tem em festa junina.',
    'Fale um doce brasileiro.',
    'Fale uma marca brasileira de chinelo.',
    'Fale um animal que representa o Brasil.',
    'Fale uma cidade do Nordeste.',
    'Fale uma comida que leva mandioca.',
    'Fale uma palavra que lembra Carnaval.',
    'Fale um programa clássico da TV brasileira.',
    'Fale um produto vendido na praia.',
    'Fale uma bebida típica do Brasil.',
    'Fale um cantor brasileiro muito famoso.'
  ]::text[]),
  ('filmes', array[
    'Fale um super-herói da Marvel.',
    'Fale uma princesa da Disney.',
    'Fale um filme de dinossauro.',
    'Fale um personagem que usa capa.',
    'Fale uma série sobre médicos.'
  ]::text[]),
  ('futebol', array[
    'Fale um jogador brasileiro camisa 10.',
    'Fale um time brasileiro rubro-negro.',
    'Fale um estádio brasileiro famoso.',
    'Fale um esporte jogado com bola.'
  ]::text[]),
  ('internet', array[
    'Fale um app de mensagem.',
    'Fale uma rede social de vídeo.',
    'Fale um app de banco.',
    'Fale um emoji de risada.',
    'Fale um site de compras.',
    'Fale um app de mapas.',
    'Fale uma senha ruim.'
  ]::text[]),
  ('musica', array[
    'Fale um cantor de sertanejo.',
    'Fale uma cantora pop internacional.',
    'Fale um instrumento de corda.',
    'Fale uma banda de rock brasileira.',
    'Fale uma música cantada em aniversário.'
  ]::text[]),
  ('nostalgia', array[
    'Fale um jogo de PlayStation 2.',
    'Fale um desenho do Cartoon Network.',
    'Fale um brinquedo de escola.',
    'Fale um site dos anos 2000.',
    'Fale uma marca de celular antiga.',
    'Fale um jogo de navegador.',
    'Fale uma guloseima da cantina.',
    'Fale um programa infantil brasileiro.',
    'Fale uma coisa gravada em CD.'
  ]::text[]),
  ('role', array[
    'Fale uma bebida de churrasco.',
    'Fale uma comida de madrugada.',
    'Fale um lugar para encontrar amigos.',
    'Fale uma desculpa para ir embora cedo.',
    'Fale uma coisa que leva para um churrasco.'
  ]::text[]),
  ('relacoes', array[
    'Fale um presente romântico.',
    'Fale um lugar de primeiro encontro.',
    'Fale uma red flag de namoro.',
    'Fale uma qualidade de bom amigo.',
    'Fale um apelido de casal.',
    'Fale um motivo de ciúme.',
    'Fale um motivo para terminar.',
    'Fale algo que casal divide.',
    'Fale um assunto ruim no primeiro encontro.'
  ]::text[]),
  ('viagens', array[
    'Fale uma coisa que vai na mala de mão.',
    'Fale um lugar para viajar no verão.',
    'Fale uma coisa que você usa no aeroporto.',
    'Fale uma coisa que tem em todo hotel.'
  ]::text[]),
  ('absurdas', array[
    'Fale um animal engraçado de chapéu.',
    'Fale uma comida ruim para levar no bolso.',
    'Fale um animal que não cabe num elevador.',
    'Fale uma coisa estranha para dar de presente.',
    'Fale uma comida que seria um perfume horrível.',
    'Fale um animal que seria péssimo motorista.',
    'Fale uma coisa que não combina com casamento.',
    'Fale um objeto estranho para levar à praia.',
    'Fale uma comida ruim para comer no cinema.',
    'Fale um animal que ficaria estranho de terno.',
    'Fale uma coisa que você não quer achar na cama.',
    'Fale um objeto inútil numa ilha deserta.',
    'Fale uma comida que não combina com ketchup.',
    'Fale um animal que seria bom segurança.',
    'Fale uma coisa ruim para cair do céu.',
    'Fale um lugar ruim para encontrar uma cobra.',
    'Fale uma coisa estranha para vender no mercado.',
    'Fale um som ruim para despertador.'
  ]::text[])
),
ranked as (
  select q.id, q.category_id,
         row_number() over (partition by q.category_id order by q.id) as rn
  from public.questions q
  where q.active = true
    and (
      char_length(q.text) > 60
      or lower(q.text) like 'se %'
      or lower(q.text) like '%melhor jeito%'
      or lower(q.text) like '%melhor forma%'
      or lower(q.text) like '%que você faria%'
      or lower(q.text) like '%você pudesse%'
      or lower(q.text) like '%virasse%'
      or lower(q.text) like '%tivesse que%'
      or lower(q.text) like '%sua vida virasse%'
      or lower(q.text) like '%fosse bilionário%'
      or lower(q.text) like '%fosse presidente%'
      or lower(q.text) like '%ficasse invisível%'
      or lower(q.text) like '%fosse um vilão%'
      or lower(q.text) like '%trocar de vida%'
    )
),
expanded as (
  select r.category_id, u.text, u.rn
  from replacements r
  cross join lateral unnest(r.texts) with ordinality as u(text, rn)
)
update public.questions q
set text = e.text,
    review_status = 'pending',
    reviewed_at = null
from ranked c
join expanded e on e.category_id = c.category_id and e.rn = c.rn
where q.id = c.id;

-- Keep the four user-rejected prompts archived, and add four fresh active
-- prompts so the playable catalog returns to exactly 500.
insert into public.questions (category_id, text, active, review_status)
values
('absurdas','Fale uma coisa estranha para colocar na pizza.',true,'pending'),
('absurdas','Fale um animal ruim para ter dentro de casa.',true,'pending'),
('absurdas','Fale uma comida que seria um sabor ruim de sorvete.',true,'pending'),
('absurdas','Fale um objeto ruim para usar como travesseiro.',true,'pending');

commit;

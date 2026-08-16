# Manada Mania

Quero que você CRIE E ENTREGUE um jogo web completo, funcional e pronto para uso chamado provisoriamente NA MANADA.

1. OBJETIVO

É um party game presencial, inspirado na mecânica de “pensar como a maioria”.

IMPORTANTE: não quero um sistema complexo.

O jogo será usado amanhã em um almoço entre amigos.

Todos estarão fisicamente no mesmo local.

APENAS UMA PESSOA, O HOST, PRECISA USAR O SITE.

Os outros jogadores NÃO acessam o sistema.

Todos respondem às perguntas EM VOZ ALTA depois de uma contagem regressiva.

O host utiliza o próprio celular para:

mostrar/ler a pergunta;

iniciar o timer;

marcar quais jogadores pontuaram;

atribuir a Vaca Rosa;

acompanhar o placar;

avançar para a próxima pergunta.

Prioridade absoluta:

SIMPLES, RÁPIDO, BONITO, MOBILE-FIRST E CONFIÁVEL.

Não transformar isso em SaaS.

2. NÃO CRIAR

Não quero:

login;

cadastro;

senha;

e-mail;

autenticação;

multiplayer;

salas;

códigos de convite;

QR Code;

WebSocket;

chat;

respostas digitadas pelos jogadores;

comparação automática de respostas;

IA para interpretar respostas;

Supabase, se não for realmente necessário;

painel administrativo;

histórico online;

perfis;

pagamentos;

ranking global;

sistema social.

Se for possível executar tudo localmente no navegador, prefira isso.

Use localStorage para salvar automaticamente a partida.

O usuário deve poder atualizar ou fechar a página e continuar a partida.

3. TECNOLOGIA

Escolha a solução MAIS SIMPLES e confiável suportada pelo ambiente.

Se React/Next/Vite já fizer parte do projeto, pode utilizar.

Não adicione infraestrutura desnecessária.

O jogo deve funcionar perfeitamente em:

iPhone;

Android;

iPad;

navegador desktop.

Mas a prioridade é:

iPhone em orientação vertical.

Interface totalmente responsiva e mobile-first.

Botões grandes e fáceis de tocar.

Respeitar safe areas do iPhone.

Não criar elementos pequenos ou difíceis de usar durante uma partida.

4. CONCEITO DA PARTIDA

Exemplo:

Pergunta:

“Fale uma comida que não pode faltar em um churrasco.”

O host aperta:

COMEÇAR — 10 SEGUNDOS

A tela mostra:

10
9
8
...
3
2
1

Ao chegar em zero:

🗣️ FALEM!

Nesse momento todos os jogadores falam suas respostas em voz alta simultaneamente.

O próprio grupo decide quais respostas significam a mesma coisa.

Exemplo:

João: Romário
Pedro: Baixinho
Giulia: Romário
Lucas: Neymar

O grupo pode decidir verbalmente que:

Romário + Baixinho = mesma resposta.

O SISTEMA NÃO PRECISA SABER AS RESPOSTAS.

O host simplesmente marca quem fez parte da maioria.

5. CONFIGURAÇÃO INICIAL

Tela inicial bonita com:

🐄 NA MANADA

Frase curta:

Pense como todo mundo. Ou fique fora da manada.

Botão:

NOVA PARTIDA

Ao clicar, abrir configuração.

6. JOGADORES

Permitir adicionar nomes rapidamente.

Interface:

Nome do jogador:

[ João ]

+ ADICIONAR

Jogadores adicionados aparecem como chips/cards:

João
Giulia
Pedro
Lucas
Marina

Permitir:

adicionar;

remover;

editar nome antes de começar.

Não obrigar quantidade fixa.

Permitir jogar a partir de 3 jogadores, mas informar discretamente que funciona melhor com 4+.

Cada jogador começa com:

0 pontos;

sem Vaca Rosa.

7. META DE PONTOS

Meta padrão:

8 pontos.

Na configuração da partida permitir, de forma simples, escolher:

5 pontos;

8 pontos;

10 pontos.

Deixar 8 selecionado por padrão.

8. CATEGORIAS DE PERGUNTAS

Criar categorias como:

🎲 Aleatório
🧠 Geral & Cotidiano
🍔 Comida & Bebida
🇧🇷 Brasil
⚽ Futebol & Esportes
🎬 Filmes & Séries
🎵 Música
📱 Internet & Cultura Pop
📼 Nostalgia anos 2000/2010
🍻 Rolê & Amigos
❤️ Relacionamentos & Vida Social
✈️ Viagens
😂 Absurdas & Engraçadas

Público principal:

brasileiros entre 25 e 29 anos em 2026.

Portanto misture perguntas universais com referências compatíveis com pessoas nascidas aproximadamente entre 1997 e 2001.

Não faça todas as perguntas nostálgicas.

9. BANCO DE PERGUNTAS

Criar inicialmente pelo menos 200 perguntas ORIGINAIS e diferentes, preferencialmente mais se isso não prejudicar a qualidade.

NÃO copiar listas integrais de jogos comerciais.

As perguntas precisam funcionar para a mecânica de maioria.

NÃO transformar em jogo de conhecimentos/trivia.

Exemplo RUIM:

“Quem ganhou a Copa de 2002?”

Existe resposta correta.

Exemplo BOM:

“Qual jogador mais representa a Seleção Brasileira?”

Exemplos do tipo de pergunta desejada:

Fale uma comida que não pode faltar em um churrasco.

Qual sabor de pizza você pediria para uma mesa inteira?

Fale um jogador que representa a Seleção Brasileira.

Qual rede social mais marcou a adolescência da nossa geração?

Fale um desenho que marcou sua infância.

Qual comida você pediria depois de voltar de uma festa?

Fale uma marca de refrigerante.

Qual aplicativo você abriria primeiro depois de ficar 24 horas sem celular?

Qual videogame mais marcou nossa geração?

Qual é a desculpa mais comum para cancelar um rolê?

Fale uma coisa que sempre tem na geladeira de um brasileiro.

Qual cidade brasileira você escolheria para passar o Réveillon?

Qual famoso brasileiro praticamente todo mundo reconheceria?

Fale uma coisa que você faria primeiro se ganhasse R$ 10 milhões.

Qual coisa alguém sempre esquece de levar para um churrasco?

Quero variedade.

Evitar dezenas de perguntas quase iguais.

As melhores perguntas criam possibilidade de convergência sem terem uma resposta objetivamente correta.

Idealmente misture aproximadamente:

60% perguntas universais;

30% Brasil/geração/cultura;

10% perguntas caóticas ou absurdas.

10. NÃO REPETIR PERGUNTAS

Durante uma mesma partida:

NÃO repetir perguntas já usadas.

Armazenar internamente quais já apareceram.

Se uma categoria acabar, pode reiniciar aquele conjunto, mas somente depois de todas terem sido utilizadas.

Adicionar:

↻ TROCAR PERGUNTA

Se o grupo não gostar da pergunta.

Trocar pergunta NÃO conta como rodada.

11. TELA PRINCIPAL DA RODADA

Deve ser a tela mais bonita do sistema.

Exemplo:

RODADA 7

Categoria:
🍻 Rolê & Amigos

Pergunta em destaque:

Qual comida você pediria depois de voltar bêbado de uma festa?

Embaixo:

5s | 10s

e botão grande:

COMEÇAR CONTAGEM

10 segundos deve ser o padrão.

O usuário pode alternar entre:

5 segundos
ou
10 segundos

durante a própria partida.

12. TIMER

Timer visual grande.

Exemplo:

10

9

8

...

Nos últimos:

3
2
1

dar maior destaque visual.

Quando chegar a zero:

mostrar grande:

🗣️ FALEM!

Pode tocar um som curto e agradável.

Se vibração estiver disponível no celular, pode dar uma vibração leve.

Não usar áudio irritante.

Ter:

REINICIAR TIMER

caso seja necessário.

13. PONTUAÇÃO MANUAL

Depois que todos falarem e decidirem verbalmente quem deu respostas equivalentes, mostrar:

QUEM ENTROU NA MANADA?

Lista de jogadores:

João [ +1 ] [ 🐄 ]
Giulia [ +1 ] [ 🐄 ]
Pedro [ +1 ] [ 🐄 ]
Lucas [ +1 ] [ 🐄 ]
Marina [ +1 ] [ 🐄 ]

O host toca em +1 ou em um botão/check para selecionar quem pontuou.

Permitir selecionar vários jogadores.

Exemplo:

✅ João
✅ Giulia
✅ Pedro

Lucas
Marina

Depois:

CONFIRMAR RODADA

Somente depois da confirmação os pontos devem ser adicionados.

Antes de confirmar, deve ser possível alterar a seleção livremente.

14. VACA ROSA

Ao lado de cada jogador haverá um botão:

🐄

ou preferencialmente:

🩷🐄

O host escolhe MANUALMENTE quem recebe a Vaca Rosa.

Somente um jogador pode possuir a Vaca Rosa por vez.

Ao selecionar outro jogador:

a Vaca Rosa é automaticamente retirada do jogador anterior e entregue ao novo.

Também deve ser possível não atribuir Vaca Rosa naquela rodada.

IMPORTANTE:

A Vaca Rosa NÃO remove pontos.

A Vaca Rosa NÃO impede o jogador de continuar pontuando.

A única penalidade é:

um jogador com a Vaca Rosa não pode vencer a partida.

Mostrar visualmente no placar quem está segurando:

João — 7
Giulia — 8 🩷🐄
Pedro — 6

Mesmo Giulia tendo atingido a meta de 8, ela ainda NÃO venceu porque está com a Vaca Rosa.

Ela pode continuar pontuando:

9 🩷🐄
10 🩷🐄
11 🩷🐄

e ainda não vence.

Quando a Vaca Rosa passar para outra pessoa, verificar imediatamente se o jogador anterior já possui pontos suficientes para vencer.

15. REGRA DA VACA ROSA PARA O GRUPO

O sistema NÃO precisa decidir automaticamente quem deveria receber a Vaca Rosa.

O grupo decide.

Mas incluir uma dica pequena na interface:

Vaca Rosa: use quando exatamente uma pessoa tiver dado uma resposta diferente de todos os demais.

Não obrigar o sistema a validar isso.

Host tem decisão final.

16. PLACAR

Mostrar placar bonito após cada rodada.

Ordenar automaticamente do maior para o menor.

Exemplo:

🥇 João — 7
🥈 Giulia — 6 🩷🐄
🥉 Pedro — 5
Lucas — 4
Marina — 2

Quem está com a Vaca Rosa deve ficar muito evidente.

Pode usar:

🩷🐄

Não use a Vaca Rosa como pontuação.

Ela é um status separado.

17. PRÓXIMA RODADA

Depois de confirmar a rodada:

mostrar resultado atualizado.

Botão principal:

PRÓXIMA PERGUNTA →

Ao avançar:

incrementar número da rodada;

selecionar uma pergunta ainda não utilizada;

limpar seleção de pontuação da rodada anterior;

manter placar;

manter Vaca Rosa;

manter jogadores;

resetar timer.

18. DESFAZER

Isso é MUITO IMPORTANTE.

Adicionar:

↶ DESFAZER ÚLTIMA RODADA

Se o host tiver marcado algo errado, deve restaurar exatamente:

pontuação anterior;

dono anterior da Vaca Rosa;

estado da rodada.

Pode utilizar snapshot do estado antes da confirmação.

Deixar esse botão menos destacado para evitar toque acidental.

19. VENCEDOR

Quando alguém atingir a meta de pontos e NÃO estiver com a Vaca Rosa:

mostrar tela de vitória bonita.

Exemplo:

🎉🐄🎉

JOÃO VENCEU!

10 rodadas tentando pensar como todo mundo.

Mostrar placar final.

Botões:

JOGAR NOVAMENTE

NOVA PARTIDA

Se houver mais de um jogador atingindo a meta simultaneamente na mesma rodada e isso gerar empate pela liderança, NÃO declarar vencedor automaticamente.

Continuar a partida até existir um único líder elegível sem a Vaca Rosa.

20. SALVAMENTO AUTOMÁTICO

Salvar tudo automaticamente no navegador usando localStorage:

jogadores;

pontos;

Vaca Rosa;

rodada;

pergunta atual;

perguntas utilizadas;

configurações;

histórico necessário para desfazer.

Se atualizar a página acidentalmente:

a partida precisa continuar exatamente de onde parou.

Na abertura, se houver partida salva, oferecer:

CONTINUAR PARTIDA

ou:

NOVA PARTIDA

Ao iniciar nova partida, pedir confirmação se existir uma partida em andamento.

21. VISUAL

Quero aparência de party game moderno e premium.

Não quero aparência genérica de dashboard empresarial.

Referências conceituais:

cards grandes;

tipografia forte;

cores alegres;

fundo contrastante;

detalhes divertidos;

emojis usados com moderação;

excelente leitura em celular;

microanimações suaves.

Pode utilizar uma identidade envolvendo:

🐄
🩷
amarelo/quente
preto/marrom escuro
creme

Mas tenha liberdade para criar uma identidade melhor.

Não copiar visual ou propriedade intelectual de Herd Mentality/Efeito Manada.

Criar identidade própria.

Nome provisório:

NA MANADA

22. EXPERIÊNCIA MOBILE

Isso será usado principalmente em um iPhone.

Portanto:

nenhuma rolagem horizontal;

nenhum modal gigante;

botões de pelo menos aproximadamente 44px de altura;

texto da pergunta grande;

timer enorme;

ação principal sempre evidente;

evitar botões muito próximos;

respeitar safe-area superior e inferior;

não exigir hover;

tudo deve funcionar com toque;

impedir zoom/layout quebrado em inputs;

excelente experiência em Safari iOS.

Se possível, permitir visual de tela cheia/PWA posteriormente, mas NÃO tornar isso necessário para esta versão.

23. FLUXO FINAL

O fluxo deve ser exatamente:

INÍCIO

↓

NOVA PARTIDA

↓

ADICIONAR JOGADORES

↓

ESCOLHER CATEGORIA + META + TIMER

↓

COMEÇAR

↓

PERGUNTA

↓

TIMER 5 OU 10 SEGUNDOS

↓

🗣️ FALEM!

↓

GRUPO DISCUTE AS RESPOSTAS VERBALMENTE

↓

HOST SELECIONA QUEM GANHOU +1

↓

HOST ATRIBUI VACA ROSA SE NECESSÁRIO

↓

CONFIRMAR RODADA

↓

PLACAR

↓

VERIFICAR VENCEDOR

↓

PRÓXIMA PERGUNTA

↓

REPETIR

24. CRITÉRIOS DE ACEITAÇÃO

Antes de considerar o trabalho concluído, validar:

Cenário 1

5 jogadores.

João, Giulia e Pedro pontuam.

Resultado:

João +1
Giulia +1
Pedro +1
outros não mudam.

Cenário 2

Lucas recebe Vaca Rosa.

Lucas continua podendo ganhar pontos normalmente.

Cenário 3

Lucas tinha Vaca Rosa.

Marina passa a receber Vaca Rosa.

Lucas perde imediatamente o status.

Marina passa a ter.

Cenário 4

João possui 8 pontos sem Vaca Rosa.

Se for único líder elegível:

João vence.

Cenário 5

Giulia possui 9 pontos com Vaca Rosa.

Ela NÃO vence.

Cenário 6

Giulia possui 9 pontos com Vaca Rosa.

Vaca Rosa passa para Pedro.

Se Giulia for líder elegível:

declarar vitória imediatamente.

Cenário 7

Host confirma rodada errada.

Clica em DESFAZER.

Pontuação e Vaca Rosa retornam exatamente ao estado anterior.

Cenário 8

Usuário atualiza a página.

Partida continua.

Cenário 9

Timer 5 segundos funciona.

Cenário 10

Timer 10 segundos funciona.

Cenário 11

Perguntas não se repetem durante a partida enquanto houver perguntas inéditas disponíveis.

25. PRIORIDADES

Se precisar escolher entre funcionalidades:

funcionamento correto;

ótima experiência no celular;

pontuação e Vaca Rosa corretas;

timer;

perguntas boas;

salvamento;

visual;

animações.

NÃO sacrificar confiabilidade para criar recursos extras.

26. IMPORTANTE SOBRE ESCOPO

Não me pergunte sobre backend, autenticação, multiplayer ou arquitetura sofisticada.

Não preciso disso agora.

Faça a versão mais simples possível capaz de entregar uma excelente partida presencial.

Não adicione funcionalidades não solicitadas.

Se encontrar alguma ambiguidade pequena, escolha a solução mais simples e coerente com o fluxo descrito.

27. ENTREGA

Quero que você:

construa a aplicação;

implemente todas as telas;

coloque as perguntas;

implemente persistência;

implemente timer;

implemente pontuação;

implemente Vaca Rosa;

implemente desfazer;

teste os fluxos principais;

corrija erros encontrados;

deixe tudo responsivo;

entregue uma versão pronta para eu abrir pelo celular e jogar.

Ao terminar, faça uma revisão final procurando principalmente:

bugs de estado;

pontuação duplicada;

botão confirmar clicado duas vezes;

Vaca Rosa em duas pessoas simultaneamente;

perda de estado ao atualizar;

perguntas repetidas;

problemas de viewport no iPhone;

timer continuando em segundo plano incorretamente;

avanço de rodada sem resetar seleções.

Não apenas descreva como fazer. Implemente o projeto.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/11fcfb1c-bad5-46a9-a647-186402eeb8d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

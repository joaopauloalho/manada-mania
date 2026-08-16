import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES, RANDOM_CATEGORY, categoryById } from "@/data/questions";
import {
  findWinner,
  loadGame,
  pickQuestion,
  playBeep,
  saveGame,
  takeSnapshot,
  uid,
  vibrate,
  type GameState,
  type Player,
} from "@/lib/na-manada";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Na Manada — Party game de pensar como a maioria" },
      {
        name: "description",
        content:
          "Party game presencial para jogar no celular: perguntas, contagem regressiva, pontuação manual e a Vaca Rosa. Só o host precisa do site.",
      },
      { property: "og:title", content: "Na Manada — Party game de pensar como a maioria" },
      {
        property: "og:description",
        content:
          "Pense como todo mundo. Ou fique fora da manada. Party game presencial, rápido e mobile-first.",
      },
    ],
  }),
  component: NaManada,
});

type Screen = "home" | "setup" | "round" | "winner";

const TARGETS = [5, 8, 10];

function NaManada() {
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [game, setGame] = useState<GameState | null>(null);
  const [saved, setSaved] = useState<GameState | null>(null);

  useEffect(() => {
    const s = loadGame();
    setSaved(s);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveGame(game);
  }, [game, hydrated]);

  const startNew = () => setScreen("setup");

  const continueSaved = () => {
    if (!saved) return;
    setGame(saved);
    setScreen(saved.winnerId ? "winner" : "round");
  };

  const beginGame = (g: GameState) => {
    setGame(g);
    setScreen("round");
  };

  const backHome = () => {
    setSaved(loadGame());
    setScreen("home");
  };

  if (!hydrated) return <div className="min-h-screen" />;

  if (screen === "setup")
    return <Setup onStart={beginGame} onCancel={backHome} hasSaved={!!saved} />;

  if (screen === "round" && game)
    return (
      <RoundScreen
        game={game}
        setGame={setGame}
        onWin={() => setScreen("winner")}
        onExit={() => {
          setSaved(loadGame());
          setScreen("home");
        }}
      />
    );

  if (screen === "winner" && game)
    return (
      <WinnerScreen
        game={game}
        onPlayAgain={() => {
          const fresh = pickQuestion(game.categoryId, []);
          setGame({
            ...game,
            players: game.players.map((p) => ({ ...p, score: 0 })),
            cowId: null,
            round: 1,
            question: fresh.question,
            usedIds: fresh.usedIds,
            winnerId: null,
            snapshot: null,
          });
          setScreen("round");
        }}
        onNewGame={() => setScreen("setup")}
      />
    );

  return <Home saved={saved} onNew={startNew} onContinue={continueSaved} />;
}

/* ---------------------------------- HOME --------------------------------- */

function Home({
  saved,
  onNew,
  onContinue,
}: {
  saved: GameState | null;
  onNew: () => void;
  onContinue: () => void;
}) {
  return (
    <main className="safe-top safe-bottom mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <div className="animate-rise">
        <div className="animate-wiggle text-7xl">🐄</div>
        <h1 className="mt-4 text-6xl font-black tracking-tighter text-primary">NA MANADA</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pense como todo mundo.
          <br />
          Ou fique fora da manada.
        </p>
      </div>

      <div className="mt-12 w-full space-y-3">
        {saved && (
          <button onClick={onContinue} className={btnPrimary}>
            CONTINUAR PARTIDA
          </button>
        )}
        <button onClick={onNew} className={saved ? btnSecondary : btnPrimary}>
          NOVA PARTIDA
        </button>
      </div>

      {saved && (
        <p className="mt-6 text-sm text-muted-foreground">
          Partida salva: rodada {saved.round} · {saved.players.length} jogadores
        </p>
      )}
    </main>
  );
}

/* --------------------------------- SETUP --------------------------------- */

function Setup({
  onStart,
  onCancel,
  hasSaved,
}: {
  onStart: (g: GameState) => void;
  onCancel: () => void;
  hasSaved: boolean;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(8);
  const [timerSec, setTimerSec] = useState<5 | 10>(10);
  const [categoryId, setCategoryId] = useState("aleatorio");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    setPlayers((p) => [...p, { id: uid(), name: n.slice(0, 18), score: 0 }]);
    setName("");
    inputRef.current?.focus();
  };

  const start = () => {
    if (players.length < 3) return;
    if (hasSaved && !confirming) {
      setConfirming(true);
      return;
    }
    const { question, usedIds } = pickQuestion(categoryId, []);
    onStart({
      players,
      cowId: null,
      target,
      timerSec,
      categoryId,
      round: 1,
      question,
      usedIds,
      winnerId: null,
      snapshot: null,
    });
  };

  return (
    <main className="safe-top safe-bottom mx-auto w-full max-w-md px-5 pb-40">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-2">
        <button onClick={onCancel} className={btnGhostSmall} aria-label="Voltar">
          ←
        </button>
        <h1 className="truncate text-2xl font-black text-primary">NOVA PARTIDA</h1>
      </header>

      <section className="mt-4">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">JOGADORES</h2>
        <div className="mt-3 flex gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Nome do jogador"
            maxLength={18}
            className="min-w-0 flex-1 rounded-2xl border border-input bg-card px-4 py-3.5 text-base outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button onClick={add} className="shrink-0 rounded-2xl bg-gradient-primary px-5 text-lg font-black text-primary-foreground shadow-pop active:scale-95">
            +
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="animate-rise flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-4 pr-2"
            >
              {editingId === p.id ? (
                <input
                  autoFocus
                  defaultValue={p.name}
                  maxLength={18}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v)
                      setPlayers((ps) =>
                        ps.map((x) => (x.id === p.id ? { ...x, name: v } : x)),
                      );
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  className="w-24 bg-transparent text-base font-semibold outline-none"
                />
              ) : (
                <button
                  onClick={() => setEditingId(p.id)}
                  className="text-base font-semibold"
                >
                  {p.name}
                </button>
              )}
              <button
                onClick={() => setPlayers((ps) => ps.filter((x) => x.id !== p.id))}
                aria-label={`Remover ${p.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {players.length < 4 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Mínimo 3 jogadores · fica melhor com 4 ou mais.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">META DE PONTOS</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {TARGETS.map((t) => (
            <button key={t} onClick={() => setTarget(t)} className={pill(target === t)}>
              {t} pts
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">TEMPO</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {([5, 10] as const).map((t) => (
            <button key={t} onClick={() => setTimerSec(t)} className={pill(timerSec === t)}>
              {t} segundos
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground">CATEGORIA</h2>
        <div className="mt-3 grid gap-2">
          <button
            onClick={() => setCategoryId("aleatorio")}
            className={pill(categoryId === "aleatorio")}
          >
            {RANDOM_CATEGORY.emoji} {RANDOM_CATEGORY.name}
          </button>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={pill(categoryId === c.id) + " text-sm"}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-5 pt-3 backdrop-blur">
        <div className="mx-auto w-full max-w-md">
          {confirming && (
            <p className="mb-2 text-center text-sm text-cow">
              Existe uma partida em andamento. Toque de novo para descartar.
            </p>
          )}
          <button
            onClick={start}
            disabled={players.length < 3}
            className={btnPrimary + " disabled:opacity-40"}
          >
            {confirming ? "CONFIRMAR E COMEÇAR" : "COMEÇAR"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* --------------------------------- ROUND --------------------------------- */

type Phase = "ready" | "counting" | "speak" | "scoring";

function RoundScreen({
  game,
  setGame,
  onWin,
  onExit,
}: {
  game: GameState;
  setGame: (g: GameState) => void;
  onWin: () => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [remaining, setRemaining] = useState(game.timerSec);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [cowPick, setCowPick] = useState<string | null>(game.cowId);
  const [confirmed, setConfirmed] = useState(false);
  const lastTickRef = useRef<number>(-1);

  const category = game.question ? categoryById(game.question.categoryId) : null;

  // countdown driven by wall clock so background/foreground stays accurate
  useEffect(() => {
    if (phase !== "counting" || endAt === null) return;
    let raf = 0;
    const loop = () => {
      const left = Math.max(0, endAt - Date.now());
      const secs = Math.ceil(left / 1000);
      setRemaining(secs);
      if (secs !== lastTickRef.current && secs > 0) {
        lastTickRef.current = secs;
        if (secs <= 3) playBeep("tick");
      }
      if (left <= 0) {
        setPhase("speak");
        playBeep("go");
        vibrate([40, 60, 40]);
        return;
      }
      raf = window.setTimeout(loop, 80);
    };
    loop();
    return () => window.clearTimeout(raf);
  }, [phase, endAt]);

  const startTimer = useCallback(() => {
    lastTickRef.current = -1;
    setRemaining(game.timerSec);
    setEndAt(Date.now() + game.timerSec * 1000);
    setPhase("counting");
  }, [game.timerSec]);

  const resetRoundUi = (g: GameState) => {
    setPhase("ready");
    setRemaining(g.timerSec);
    setEndAt(null);
    setPicked([]);
    setCowPick(g.cowId);
    setConfirmed(false);
  };

  const swapQuestion = () => {
    const { question, usedIds } = pickQuestion(
      game.categoryId,
      game.usedIds,
      game.question?.id,
    );
    setGame({ ...game, question, usedIds });
  };

  const confirmRound = () => {
    if (confirmed) return;
    setConfirmed(true);
    const snapshot = takeSnapshot(game);
    const players = game.players.map((p) =>
      picked.includes(p.id) ? { ...p, score: p.score + 1 } : p,
    );
    const cowId = cowPick;
    const winnerId = findWinner(players, cowId, game.target);
    const next = { ...game, players, cowId, winnerId, snapshot };
    setGame(next);
    vibrate(20);
    if (winnerId) {
      setTimeout(onWin, 400);
    }
  };

  const undo = () => {
    if (!game.snapshot) return;
    const s = game.snapshot;
    const restored: GameState = {
      ...game,
      players: s.players,
      cowId: s.cowId,
      round: s.round,
      question: s.question,
      usedIds: s.usedIds,
      winnerId: null,
      snapshot: null,
    };
    setGame(restored);
    resetRoundUi(restored);
  };

  const nextQuestion = () => {
    const { question, usedIds } = pickQuestion(game.categoryId, game.usedIds);
    const next: GameState = {
      ...game,
      round: game.round + 1,
      question,
      usedIds,
      snapshot: null,
    };
    setGame(next);
    resetRoundUi(next);
  };

  const setTimerSec = (t: 5 | 10) => {
    setGame({ ...game, timerSec: t });
    setRemaining(t);
  };

  const ranked = useMemo(
    () => [...game.players].sort((a, b) => b.score - a.score),
    [game.players],
  );

  return (
    <main className="safe-top safe-bottom mx-auto w-full max-w-md px-5 pb-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-widest text-muted-foreground">
            RODADA {game.round} · META {game.target}
          </p>
          <p className="truncate text-base font-bold text-primary">
            {category ? `${category.emoji} ${category.name}` : "🎲 Aleatório"}
          </p>
        </div>
        <button onClick={onExit} className={btnGhostSmall} aria-label="Início">
          ⌂
        </button>
      </header>

      {phase === "counting" || phase === "speak" ? (
        <section className="mt-10 flex flex-col items-center">
          {phase === "counting" ? (
            <div
              key={remaining}
              className={
                "animate-tick font-display font-black tabular-nums " +
                (remaining <= 3
                  ? "text-[10rem] leading-none text-cow drop-shadow-[0_0_30px_oklch(0.75_0.17_355_/_0.5)]"
                  : "text-[8rem] leading-none text-primary")
              }
            >
              {remaining}
            </div>
          ) : (
            <div className="animate-tick py-6 text-center">
              <div className="text-7xl">🗣️</div>
              <p className="mt-4 text-5xl font-black text-primary">FALEM!</p>
            </div>
          )}

          <p className="mt-8 text-center text-lg font-semibold text-muted-foreground">
            {game.question?.text}
          </p>

          <div className="mt-10 w-full space-y-3">
            {phase === "speak" && (
              <button onClick={() => setPhase("scoring")} className={btnPrimary}>
                QUEM ENTROU NA MANADA?
              </button>
            )}
            <button onClick={startTimer} className={btnSecondary}>
              ↻ REINICIAR TIMER
            </button>
          </div>
        </section>
      ) : phase === "ready" ? (
        <section className="mt-4">
          <div className="animate-rise rounded-4xl border border-border bg-card p-6 shadow-pop">
            <p className="text-[1.75rem] font-black leading-tight">{game.question?.text}</p>
          </div>

          <button onClick={swapQuestion} className="mt-3 w-full py-3 text-sm font-bold text-muted-foreground">
            ↻ TROCAR PERGUNTA
          </button>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {([5, 10] as const).map((t) => (
              <button key={t} onClick={() => setTimerSec(t)} className={pill(game.timerSec === t)}>
                {t}s
              </button>
            ))}
          </div>

          <button onClick={startTimer} className={btnPrimary + " mt-4"}>
            COMEÇAR CONTAGEM
          </button>

          <Scoreboard players={ranked} cowId={game.cowId} />

          {game.snapshot && (
            <button onClick={undo} className="mt-6 w-full py-3 text-sm text-muted-foreground underline">
              ↶ desfazer última rodada
            </button>
          )}
        </section>
      ) : (
        <section className="mt-2">
          <h2 className="text-2xl font-black">QUEM ENTROU NA MANADA?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Toque nos jogadores que deram a resposta da maioria.
          </p>

          <div className="mt-4 space-y-2">
            {game.players.map((p) => {
              const on = picked.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={
                    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border p-2 pl-4 transition-colors " +
                    (on ? "border-primary bg-primary/15" : "border-border bg-card")
                  }
                >
                  <button
                    disabled={confirmed}
                    onClick={() =>
                      setPicked((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))
                    }
                    className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-3 text-left"
                  >
                    <span
                      className={
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-black " +
                        (on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")
                      }
                    >
                      {on ? "✓" : "+1"}
                    </span>
                    <span className="truncate text-lg font-bold">
                      {p.name} <span className="text-muted-foreground">· {p.score}</span>
                    </span>
                  </button>
                  <button
                    disabled={confirmed}
                    aria-label={`Vaca Rosa para ${p.name}`}
                    onClick={() => setCowPick((c) => (c === p.id ? null : p.id))}
                    className={
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl transition-transform active:scale-90 " +
                      (cowPick === p.id
                        ? "bg-gradient-cow shadow-pop"
                        : "bg-secondary opacity-50 grayscale")
                    }
                  >
                    🐄
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            🩷 Vaca Rosa: use quando exatamente uma pessoa der uma resposta diferente de todas as
            outras. Ela não tira pontos — só impede a vitória enquanto estiver com ela.
          </p>
          {cowPick && (
            <button
              disabled={confirmed}
              onClick={() => setCowPick(null)}
              className="mt-2 w-full py-2 text-sm text-muted-foreground underline"
            >
              não atribuir Vaca Rosa nesta rodada
            </button>
          )}

          {!confirmed ? (
            <button onClick={confirmRound} className={btnPrimary + " mt-6"}>
              CONFIRMAR RODADA
            </button>
          ) : (
            <>
              <Scoreboard players={ranked} cowId={game.cowId} />
              <button onClick={nextQuestion} className={btnPrimary + " mt-6"}>
                PRÓXIMA PERGUNTA →
              </button>
              <button
                onClick={undo}
                className="mt-3 w-full py-3 text-sm text-muted-foreground underline"
              >
                ↶ desfazer última rodada
              </button>
            </>
          )}
        </section>
      )}
    </main>
  );
}

/* ------------------------------- SCOREBOARD ------------------------------ */

const MEDALS = ["🥇", "🥈", "🥉"];

function Scoreboard({ players, cowId }: { players: Player[]; cowId: string | null }) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold tracking-widest text-muted-foreground">PLACAR</h3>
      <div className="mt-3 space-y-2">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={
              "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-4 py-3 " +
              (p.id === cowId ? "border-cow bg-cow/15" : "border-border bg-card")
            }
          >
            <span className="w-6 shrink-0 text-center text-lg">{MEDALS[i] ?? "·"}</span>
            <span className="truncate text-lg font-bold">
              {p.name}
              {p.id === cowId && <span className="ml-2">🩷🐄</span>}
            </span>
            <span className="shrink-0 text-2xl font-black tabular-nums text-primary">
              {p.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- WINNER -------------------------------- */

function WinnerScreen({
  game,
  onPlayAgain,
  onNewGame,
}: {
  game: GameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}) {
  const winner = game.players.find((p) => p.id === game.winnerId);
  const ranked = [...game.players].sort((a, b) => b.score - a.score);
  useEffect(() => {
    vibrate([60, 80, 60, 80, 120]);
  }, []);

  return (
    <main className="safe-top safe-bottom mx-auto w-full max-w-md px-5 pb-8">
      <div className="animate-rise mt-8 text-center">
        <div className="text-6xl">🎉🐄🎉</div>
        <h1 className="mt-4 break-words text-5xl font-black text-primary">
          {winner?.name.toUpperCase()} VENCEU!
        </h1>
        <p className="mt-3 text-muted-foreground">
          {game.round} {game.round === 1 ? "rodada" : "rodadas"} tentando pensar como todo mundo.
        </p>
      </div>

      <Scoreboard players={ranked} cowId={game.cowId} />

      <div className="mt-8 space-y-3">
        <button onClick={onPlayAgain} className={btnPrimary}>
          JOGAR NOVAMENTE
        </button>
        <button onClick={onNewGame} className={btnSecondary}>
          NOVA PARTIDA
        </button>
      </div>
    </main>
  );
}

/* --------------------------------- STYLES -------------------------------- */

const btnPrimary =
  "w-full rounded-2xl bg-gradient-primary px-6 py-4 text-lg font-black tracking-wide text-primary-foreground shadow-pop transition-transform active:scale-[0.97]";

const btnSecondary =
  "w-full rounded-2xl border border-border bg-card px-6 py-4 text-lg font-bold text-foreground transition-transform active:scale-[0.97]";

const btnGhostSmall =
  "grid h-11 w-11 place-items-center rounded-2xl border border-border bg-card text-xl";

const pill = (active: boolean) =>
  "min-h-12 rounded-2xl border px-4 py-3 text-base font-bold transition-colors " +
  (active
    ? "border-primary bg-primary/20 text-primary"
    : "border-border bg-card text-muted-foreground");

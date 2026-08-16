import { ALL_QUESTIONS } from "@/data/questions";

export type Player = { id: string; name: string; score: number };

export type Question = { id: string; text: string; categoryId: string };

export type GameState = {
  players: Player[];
  cowId: string | null;
  target: number;
  timerSec: 5 | 10;
  categoryId: string; // "aleatorio" or a category id
  round: number;
  question: Question | null;
  usedIds: string[];
  winnerId: string | null;
  snapshot: Snapshot | null;
};

export type Snapshot = {
  players: Player[];
  cowId: string | null;
  round: number;
  question: Question | null;
  usedIds: string[];
  winnerId: string | null;
};

export const STORAGE_KEY = "na-manada:v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

let questionSource: Question[] = ALL_QUESTIONS;

/**
 * Replaces the bundled catalog when Supabase has an active remote catalog.
 * Empty remote results are ignored so the app keeps working offline and during
 * initial database setup.
 */
export function setQuestionSource(questions: Question[]) {
  if (questions.length > 0) questionSource = questions;
}

export function poolFor(categoryId: string): Question[] {
  return categoryId === "aleatorio"
    ? questionSource
    : questionSource.filter((q) => q.categoryId === categoryId);
}

/** Picks an unused question; resets the used set for that pool when exhausted. */
export function pickQuestion(
  categoryId: string,
  usedIds: string[],
  excludeId?: string,
): { question: Question; usedIds: string[] } {
  const pool = poolFor(categoryId);
  let used = usedIds;
  let available = pool.filter((q) => !used.includes(q.id) && q.id !== excludeId);
  if (available.length === 0) {
    const poolIds = new Set(pool.map((q) => q.id));
    used = used.filter((id) => !poolIds.has(id));
    available = pool.filter((q) => q.id !== excludeId);
  }
  const question = available[Math.floor(Math.random() * available.length)]!;
  return { question, usedIds: [...used, question.id] };
}

export function takeSnapshot(g: GameState): Snapshot {
  return {
    players: g.players.map((p) => ({ ...p })),
    cowId: g.cowId,
    round: g.round,
    question: g.question,
    usedIds: [...g.usedIds],
    winnerId: g.winnerId,
  };
}

/** Winner = a single eligible (no pink cow) player at/above target with the top score. */
export function findWinner(players: Player[], cowId: string | null, target: number) {
  const eligible = players.filter((p) => p.id !== cowId && p.score >= target);
  if (eligible.length === 0) return null;
  const max = Math.max(...eligible.map((p) => p.score));
  const leaders = eligible.filter((p) => p.score === max);
  return leaders.length === 1 ? leaders[0]!.id : null;
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || !Array.isArray(parsed.players) || parsed.players.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGame(g: GameState | null) {
  if (typeof window === "undefined") return;
  try {
    if (g) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota errors */
  }
}

type AudioGraph = {
  ctx: AudioContext;
  master: GainNode;
};

let audioGraph: AudioGraph | null = null;

function getAudioGraph(): AudioGraph | null {
  if (typeof window === "undefined") return null;
  if (audioGraph && audioGraph.ctx.state !== "closed") return audioGraph;

  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;

  const ctx = new Ctx();
  const master = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();

  compressor.threshold.setValueAtTime(-20, ctx.currentTime);
  compressor.knee.setValueAtTime(10, ctx.currentTime);
  compressor.ratio.setValueAtTime(8, ctx.currentTime);
  compressor.attack.setValueAtTime(0.002, ctx.currentTime);
  compressor.release.setValueAtTime(0.12, ctx.currentTime);
  master.gain.setValueAtTime(0.95, ctx.currentTime);
  master.connect(compressor);
  compressor.connect(ctx.destination);

  audioGraph = { ctx, master };
  return audioGraph;
}

/**
 * iOS/Safari only allows WebAudio to become active from a real user gesture.
 * We unlock once on a touch/click and keep the same AudioContext alive for the
 * whole game, so the final "FALEM!" still plays several seconds later.
 */
export function unlockAudio() {
  try {
    const graph = getAudioGraph();
    if (!graph) return;

    const { ctx, master } = graph;
    void ctx.resume().then(() => {
      // A near-silent 15 ms pulse makes the unlock reliable on iOS Safari/PWA.
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.0001, now);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 0.015);
    }).catch(() => {});
  } catch {
    /* audio not available */
  }
}

/**
 * Party-room countdown sound: bright and compressed for phone speakers.
 * Uses the already-unlocked persistent AudioContext so mobile Safari cannot
 * drop the final cue after the countdown.
 */
export function playBeep(kind: "tick" | "go") {
  try {
    const graph = getAudioGraph();
    if (!graph) return;
    const { ctx, master } = graph;

    if (ctx.state === "suspended") void ctx.resume().catch(() => {});

    const tone = (
      frequency: number,
      start: number,
      duration: number,
      level: number,
      type: OscillatorType = "square",
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(level, start + 0.012);
      gain.gain.setValueAtTime(level, Math.max(start + 0.013, start + duration - 0.045));
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.01);
    };

    const now = ctx.currentTime + 0.015;

    if (kind === "go") {
      // Mobile-first final cue: immediate strong tone + two rising accents.
      // The first note starts immediately so iOS cannot miss a delayed-only cue.
      tone(880, now, 0.28, 0.58);
      tone(1175, now + 0.18, 0.3, 0.62);
      tone(1568, now + 0.38, 0.62, 0.68);
      tone(660, now + 0.38, 0.62, 0.22, "triangle");
    } else {
      tone(988, now, 0.2, 0.46);
      tone(1480, now + 0.008, 0.15, 0.15, "sine");
    }
  } catch {
    /* audio not available */
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

// Unlock WebAudio from the first real gesture. This is intentionally installed
// globally because the timer itself fires asynchronously several seconds later.
if (typeof window !== "undefined") {
  const unlockFromGesture = () => unlockAudio();
  window.addEventListener("pointerdown", unlockFromGesture, { passive: true });
  window.addEventListener("touchend", unlockFromGesture, { passive: true });
  window.addEventListener("click", unlockFromGesture, { passive: true });

  // Load the Supabase catalog opportunistically in the browser. The bundled
  // catalog remains the source of truth whenever the remote catalog is empty or
  // unavailable, so a network/database issue never blocks a game.
  void import("@/lib/remote-questions")
    .then(({ fetchRemoteQuestions }) => fetchRemoteQuestions())
    .then(setQuestionSource)
    .catch(() => {});
}

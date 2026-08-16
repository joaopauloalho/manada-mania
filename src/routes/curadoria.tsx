import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES } from "@/data/questions";
import {
  fetchReviewQuestions,
  reviewQuestion,
  type ReviewQuestion,
  type ReviewStatus,
} from "@/lib/remote-questions";

export const Route = createFileRoute("/curadoria")({
  head: () => ({
    meta: [
      { title: "Curadoria de perguntas — Na Manada" },
      { name: "description", content: "Aprove, recuse e gerencie as perguntas do Na Manada." },
    ],
  }),
  component: Curadoria,
});

const CODE_KEY = "na-manada:curadoria-code";

function categoryMeta(id: string) {
  return CATEGORIES.find((category) => category.id === id) ?? {
    id,
    emoji: "❓",
    name: id,
    questions: [],
  };
}

function statusLabel(status: ReviewStatus) {
  if (status === "approved") return "Aprovada";
  if (status === "rejected") return "Recusada";
  return "Pendente";
}

function Curadoria() {
  const [code, setCode] = useState("");
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"swipe" | "all">("swipe");
  const [status, setStatus] = useState<"all" | ReviewStatus>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [lastReviewedId, setLastReviewedId] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);

  async function unlock(candidate: string) {
    if (!candidate.trim()) return;
    setLoading(true);
    setError("");
    try {
      const rows = await fetchReviewQuestions(candidate.trim());
      setCode(candidate.trim());
      setQuestions(rows);
      setUnlocked(true);
      window.localStorage.setItem(CODE_KEY, candidate.trim());
    } catch (err) {
      setUnlocked(false);
      setError(err instanceof Error ? err.message : "Não foi possível abrir a curadoria.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(CODE_KEY);
    if (saved) void unlock(saved);
  }, []);

  const pending = useMemo(
    () => questions.filter((question) => question.reviewStatus === "pending"),
    [questions],
  );
  const current = pending[0] ?? null;

  const stats = useMemo(
    () => ({
      total: questions.length,
      pending: questions.filter((q) => q.reviewStatus === "pending").length,
      approved: questions.filter((q) => q.reviewStatus === "approved").length,
      rejected: questions.filter((q) => q.reviewStatus === "rejected").length,
    }),
    [questions],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("pt-BR");
    return questions.filter((question) => {
      if (status !== "all" && question.reviewStatus !== status) return false;
      if (category !== "all" && question.categoryId !== category) return false;
      if (needle && !question.text.toLocaleLowerCase("pt-BR").includes(needle)) return false;
      return true;
    });
  }, [questions, status, category, search]);

  async function act(question: ReviewQuestion, action: "approve" | "reject" | "pending" | "delete") {
    setBusyId(question.id);
    setError("");
    try {
      await reviewQuestion(code, question.id, action);
      if (action === "delete") {
        setQuestions((items) => items.filter((item) => item.id !== question.id));
      } else {
        setQuestions((items) =>
          items.map((item) =>
            item.id === question.id
              ? {
                  ...item,
                  active: action !== "reject",
                  reviewStatus:
                    action === "approve"
                      ? "approved"
                      : action === "reject"
                        ? "rejected"
                        : "pending",
                  reviewedAt: action === "pending" ? null : new Date().toISOString(),
                }
              : item,
          ),
        );
      }
      if (action === "approve" || action === "reject") setLastReviewedId(question.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar essa decisão.");
    } finally {
      setBusyId(null);
    }
  }

  async function undoLast() {
    if (!lastReviewedId) return;
    const question = questions.find((item) => item.id === lastReviewedId);
    if (!question) return;
    await act(question, "pending");
    setLastReviewedId(null);
  }

  if (!unlocked) {
    return (
      <main className="safe-top safe-bottom mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
        <a href="/" className="mb-8 text-sm font-bold text-primary">← VOLTAR AO JOGO</a>
        <div className="text-6xl">🐄</div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">CURADORIA</h1>
        <p className="mt-3 text-muted-foreground">
          Entre com o código de administrador para revisar o banco de perguntas.
        </p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void unlock(code);
          }}
        >
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            className="min-h-14 w-full rounded-2xl border border-border bg-card px-4 text-base font-bold outline-none focus:border-primary"
            placeholder="Código de curadoria"
          />
          <button
            disabled={loading || !code.trim()}
            className="min-h-14 w-full rounded-2xl bg-primary px-5 font-black text-primary-foreground disabled:opacity-50"
          >
            {loading ? "ABRINDO..." : "ENTRAR"}
          </button>
        </form>
        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      </main>
    );
  }

  return (
    <main className="safe-top safe-bottom mx-auto min-h-screen w-full max-w-lg px-4 pb-12">
      <header className="flex items-start justify-between gap-3 py-5">
        <div>
          <a href="/" className="text-xs font-black text-primary">← JOGO</a>
          <h1 className="mt-1 text-3xl font-black tracking-tight">CURADORIA 🐄</h1>
          <p className="text-sm text-muted-foreground">500 perguntas no catálogo</p>
        </div>
        <button
          onClick={() => {
            window.localStorage.removeItem(CODE_KEY);
            setUnlocked(false);
            setCode("");
          }}
          className="rounded-xl border border-border px-3 py-2 text-xs font-bold"
        >
          SAIR
        </button>
      </header>

      <section className="grid grid-cols-4 gap-2">
        <Stat value={stats.total} label="Total" />
        <Stat value={stats.pending} label="Pendentes" />
        <Stat value={stats.approved} label="Mantidas" />
        <Stat value={stats.rejected} label="Recusadas" />
      </section>

      <div className="mt-5 grid grid-cols-2 rounded-2xl bg-card p-1">
        <button
          onClick={() => setMode("swipe")}
          className={`min-h-11 rounded-xl text-sm font-black ${mode === "swipe" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          🔥 TINDER
        </button>
        <button
          onClick={() => setMode("all")}
          className={`min-h-11 rounded-xl text-sm font-black ${mode === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          📚 TODAS
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {mode === "swipe" ? (
        <section className="mt-6">
          {current ? (
            <>
              <div
                className="flex min-h-[360px] select-none flex-col justify-between rounded-[2rem] border border-border bg-card p-6 shadow-xl"
                onTouchStart={(event) => {
                  touchX.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (touchX.current === null || !current) return;
                  const end = event.changedTouches[0]?.clientX ?? touchX.current;
                  const delta = end - touchX.current;
                  touchX.current = null;
                  if (Math.abs(delta) < 70 || busyId) return;
                  void act(current, delta > 0 ? "approve" : "reject");
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                      {categoryMeta(current.categoryId).emoji} {categoryMeta(current.categoryId).name}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {stats.pending} pendentes
                    </span>
                  </div>
                  <p className="mt-10 text-3xl font-black leading-tight">{current.text}</p>
                </div>
                <p className="text-center text-xs font-semibold text-muted-foreground">
                  ← recusar · deslize · manter →
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  disabled={busyId === current.id}
                  onClick={() => void act(current, "reject")}
                  className="min-h-16 rounded-2xl border-2 border-destructive bg-destructive/10 text-lg font-black text-destructive disabled:opacity-50"
                >
                  ❌ RECUSAR
                </button>
                <button
                  disabled={busyId === current.id}
                  onClick={() => void act(current, "approve")}
                  className="min-h-16 rounded-2xl bg-primary text-lg font-black text-primary-foreground disabled:opacity-50"
                >
                  ✅ MANTER
                </button>
              </div>
              {lastReviewedId && (
                <button onClick={() => void undoLast()} className="mt-3 min-h-11 w-full text-sm font-bold text-muted-foreground">
                  ↩ DESFAZER ÚLTIMA
                </button>
              )}
            </>
          ) : (
            <div className="rounded-[2rem] border border-border bg-card p-8 text-center">
              <div className="text-6xl">🎉</div>
              <h2 className="mt-4 text-2xl font-black">Fila zerada!</h2>
              <p className="mt-2 text-muted-foreground">Você revisou todas as perguntas pendentes.</p>
              <button onClick={() => setMode("all")} className="mt-6 min-h-12 rounded-xl bg-primary px-5 font-black text-primary-foreground">
                VER TODAS
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="mt-5">
          <div className="grid gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar pergunta..."
              className="min-h-12 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | ReviewStatus)}
                className="min-h-12 rounded-xl border border-border bg-card px-3"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Mantidas</option>
                <option value="rejected">Recusadas</option>
              </select>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-12 rounded-xl border border-border bg-card px-3"
              >
                <option value="all">Todas categorias</option>
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.emoji} {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="my-4 text-sm font-bold text-muted-foreground">{filtered.length} perguntas</p>

          <div className="space-y-3">
            {filtered.map((question) => (
              <article key={question.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                  <span>{categoryMeta(question.categoryId).emoji} {categoryMeta(question.categoryId).name}</span>
                  <span className={`rounded-full px-2 py-1 ${
                    question.reviewStatus === "approved"
                      ? "bg-primary/10 text-primary"
                      : question.reviewStatus === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {statusLabel(question.reviewStatus)}
                  </span>
                </div>
                <p className="mt-3 text-lg font-extrabold leading-snug">{question.text}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.reviewStatus !== "approved" && (
                    <button
                      disabled={busyId === question.id}
                      onClick={() => void act(question, "approve")}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
                    >
                      ✅ MANTER
                    </button>
                  )}
                  {question.reviewStatus !== "rejected" && (
                    <button
                      disabled={busyId === question.id}
                      onClick={() => void act(question, "reject")}
                      className="rounded-xl border border-destructive px-3 py-2 text-xs font-black text-destructive"
                    >
                      ❌ RECUSAR
                    </button>
                  )}
                  {question.reviewStatus !== "pending" && (
                    <button
                      disabled={busyId === question.id}
                      onClick={() => void act(question, "pending")}
                      className="rounded-xl border border-border px-3 py-2 text-xs font-black"
                    >
                      ↩ PENDENTE
                    </button>
                  )}
                  {question.reviewStatus === "rejected" && (
                    <button
                      disabled={busyId === question.id}
                      onClick={() => {
                        if (window.confirm("Excluir essa pergunta definitivamente do banco?")) {
                          void act(question, "delete");
                        }
                      }}
                      className="ml-auto rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground"
                    >
                      🗑 EXCLUIR
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-card p-3 text-center">
      <div className="text-xl font-black text-primary">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

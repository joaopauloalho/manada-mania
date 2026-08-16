import type { Question } from "@/lib/na-manada";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://lhldptvhjfqgqxochgwc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_AHvEF2t6YHowM88fKHJICA_lBM99AMa";

type QuestionRow = {
  id: string;
  text: string;
  category_id: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewQuestion = {
  id: string;
  text: string;
  categoryId: string;
  active: boolean;
  reviewStatus: ReviewStatus;
  createdAt: string;
  reviewedAt: string | null;
};

function apiHeaders() {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    "Content-Type": "application/json",
  };
}

async function parseError(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? `Erro Supabase (${response.status})`;
  } catch {
    return `Erro Supabase (${response.status})`;
  }
}

/**
 * Loads the public active catalog from Supabase.
 * Returns an empty array on an empty catalog so the app can keep using its
 * bundled question set as an offline-safe fallback.
 */
export async function fetchRemoteQuestions(): Promise<Question[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/questions`);
  url.searchParams.set("select", "id,text,category_id");
  url.searchParams.set("active", "eq.true");

  const response = await fetch(url, { headers: apiHeaders() });
  if (!response.ok) throw new Error(await parseError(response));

  const rows = (await response.json()) as QuestionRow[];
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    categoryId: row.category_id,
  }));
}

export async function fetchReviewQuestions(code: string): Promise<ReviewQuestion[]> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_question_review_queue`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ p_code: code }),
  });
  if (!response.ok) throw new Error(await parseError(response));

  const rows = (await response.json()) as Array<{
    id: string;
    text: string;
    category_id: string;
    active: boolean;
    review_status: ReviewStatus;
    created_at: string;
    reviewed_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    categoryId: row.category_id,
    active: row.active,
    reviewStatus: row.review_status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  }));
}

export async function reviewQuestion(
  code: string,
  id: string,
  action: "approve" | "reject" | "pending" | "delete",
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/review_question`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify({ p_code: code, p_id: id, p_action: action }),
  });
  if (!response.ok) throw new Error(await parseError(response));
}

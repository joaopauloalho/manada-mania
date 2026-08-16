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

/**
 * Loads the public question catalog from Supabase.
 * Returns an empty array on an empty catalog so the app can keep using its
 * bundled question set as an offline-safe fallback.
 */
export async function fetchRemoteQuestions(): Promise<Question[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/questions`);
  url.searchParams.set("select", "id,text,category_id");
  url.searchParams.set("active", "eq.true");

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase questions request failed (${response.status})`);
  }

  const rows = (await response.json()) as QuestionRow[];
  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    categoryId: row.category_id,
  }));
}

import { CVAnalysisSchema } from "@/types/cv-analysis";
import { z } from "zod";

/**
 * The last analysis, kept in localStorage so a refresh does not throw away a
 * result the user paid a model call for — along with the fix-list checkboxes
 * they ticked while working through it. Only the reset button clears it.
 *
 * The uploaded file itself is deliberately not stored: it cannot be
 * reconstructed from localStorage, and the results view never needs it.
 */
const STORAGE_KEY = "cv-analysis:last";

/** Analyses expire rather than sitting in a shared browser indefinitely. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type AnalysisRating = "up" | "down";

const StoredAnalysisSchema = z.object({
  savedAt: z.number(),
  results: CVAnalysisSchema,
  /** Whether the stored analysis was run with a job description. */
  hasJobDescription: z.boolean(),
  /** Fix-list checkboxes, keyed by the fix ids the results view builds. */
  done: z.record(z.string(), z.boolean()),
  rating: z.enum(["up", "down"]).nullable(),
});

export type StoredAnalysis = z.infer<typeof StoredAnalysisSchema>;

/**
 * Reads the stored analysis, or null if there is none, it is unreadable, or it
 * has expired. Validated against the same schema the API returns, so a stored
 * entry from an older schema is dropped instead of crashing the results view.
 */
export function loadAnalysis(): StoredAnalysis | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage disabled (private mode, blocked cookies) — nothing to restore.
    return null;
  }
  if (!raw) return null;

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    clearAnalysis();
    return null;
  }

  const parsed = StoredAnalysisSchema.safeParse(json);
  if (!parsed.success) {
    clearAnalysis();
    return null;
  }

  if (Date.now() - parsed.data.savedAt > MAX_AGE_MS) {
    clearAnalysis();
    return null;
  }

  return parsed.data;
}

/** Stores a freshly completed analysis, resetting any previous progress. */
export function saveAnalysis(
  analysis: Pick<StoredAnalysis, "results" | "hasJobDescription">,
): void {
  write({
    savedAt: Date.now(),
    results: analysis.results,
    hasJobDescription: analysis.hasJobDescription,
    done: {},
    rating: null,
  });
}

/**
 * Updates the progress kept alongside the stored analysis. A no-op when there
 * is nothing stored — a reset or expiry must not be undone by a late write.
 */
export function patchAnalysis(
  patch: Partial<Pick<StoredAnalysis, "done" | "rating">>,
): void {
  const current = loadAnalysis();
  if (!current) return;
  write({ ...current, ...patch });
}

export function clearAnalysis(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — see loadAnalysis.
  }
}

function write(analysis: StoredAnalysis): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
  } catch {
    // Quota or disabled storage. Persistence is a convenience here, so the
    // in-memory analysis stays usable for this session either way.
  }
}

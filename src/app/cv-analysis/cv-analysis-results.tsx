"use client";

import { CVConsultingButton } from "@/components/landing-page/buttons";
import { track } from "@/services/analytics";
import { cn } from "@/services/utils";
import {
  type CVAnalysisResults as CVAnalysisResultsType,
  visibleDimensions,
} from "@/types/cv-analysis";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { type AnalysisRating, patchAnalysis } from "./analysis-storage";

/**
 * Two views of the same analysis:
 *
 * - "fixes" (default) — a priority-ordered worklist. What to change, in order,
 *   with checkboxes so the reader can track their way through it.
 * - "score" — where the CV stands and why, broken down by rubric dimension.
 *
 * The fix list carries no per-item point values: the model does not attribute
 * points to individual fixes, and inventing them would put fabricated numbers
 * in front of users. Priority order is what it can honestly express.
 */
type View = "fixes" | "score";

/**
 * The displayed total is the sum of the sub-scores actually shown, not
 * `match_percentage`. The schema requires the two to agree, but summing what
 * is on screen guarantees the number and the breakdown never contradict each
 * other — and that a drifting model can never render something like "92 / 50".
 */
function scoreTotals(
  results: CVAnalysisResultsType,
  hasJobDescription: boolean,
) {
  const dimensions = visibleDimensions(hasJobDescription);
  return {
    dimensions,
    total: dimensions.reduce((sum, d) => sum + results.scores[d.key], 0),
    reachable: dimensions.reduce((sum, d) => sum + d.max, 0),
  };
}

interface CVAnalysisResultsProps {
  results: CVAnalysisResultsType;
  className?: string;
  hasJobDescription?: boolean;
  /** Checkboxes and vote restored from a previous visit, keyed by fix id. */
  initialDone?: Record<string, boolean>;
  initialRating?: Rating | null;
}

export function CVAnalysisResults({
  results,
  className,
  hasJobDescription = false,
  initialDone,
  initialRating = null,
}: CVAnalysisResultsProps) {
  const [view, setView] = useState<View>("fixes");
  const { total, reachable } = scoreTotals(results, hasJobDescription);

  /**
   * Ticked fixes live here rather than in the fix list itself so that switching
   * to the score view and back does not wipe them. Every change is mirrored to
   * localStorage, which is what survives a refresh.
   */
  const [done, setDone] = useState<Record<string, boolean>>(initialDone ?? {});
  const toggleFix = (id: string) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    patchAnalysis({ done: next });
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-border px-3 py-1 text-sm tabular-nums text-muted-foreground">
          <span dir="ltr">
            {total} / {reachable}
          </span>
        </span>
        {results.job_title && (
          <span className="text-sm text-muted-foreground">
            זוהה כ: <span className="font-medium">{results.job_title}</span>
          </span>
        )}
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "fixes" ? (
        <FixListView
          results={results}
          hasJobDescription={hasJobDescription}
          done={done}
          toggle={toggleFix}
          onShowScore={() => setView("score")}
        />
      ) : (
        <ScoreView results={results} hasJobDescription={hasJobDescription} />
      )}

      <AnalysisFeedback
        results={results}
        hasJobDescription={hasJobDescription}
        view={view}
        score={total}
        reachable={reachable}
        initialRating={initialRating}
      />
    </div>
  );
}

type Rating = AnalysisRating;

/**
 * Was the analysis any good? One vote per analysis — locking after the first
 * click keeps the PostHog counts a tally of analyses rather than of clicks.
 * The vote is persisted with the analysis so a refresh cannot buy a second one.
 */
function AnalysisFeedback({
  results,
  hasJobDescription,
  view,
  score,
  reachable,
  initialRating,
}: {
  results: CVAnalysisResultsType;
  hasJobDescription: boolean;
  view: View;
  score: number;
  reachable: number;
  initialRating: Rating | null;
}) {
  const [rating, setRating] = useState<Rating | null>(initialRating);

  const vote = (next: Rating) => {
    if (rating) return;
    setRating(next);
    patchAnalysis({ rating: next });
    track("cv_analysis_feedback", {
      rating: next,
      // Which view they were reading when they judged it.
      view,
      has_job_description: hasJobDescription,
      score,
      reachable,
      // Deliberately no job_title: it is derived from the user's CV, and this
      // endpoint had a privacy pass (plan 003). Counts are enough here.
      red_flag_count: results.red_flags.length,
      improvement_count: results.improvements.length,
    });
  };

  return (
    <section className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
      <p className="text-sm text-muted-foreground">
        {rating ? "תודה, זה עוזר לנו לשפר את הניתוח." : "הניתוח היה מדויק?"}
      </p>
      <div className="flex gap-2">
        <FeedbackButton
          label="הניתוח היה מדויק"
          icon={<ThumbsUp className="h-4 w-4" />}
          selected={rating === "up"}
          dimmed={rating === "down"}
          onClick={() => vote("up")}
          disabled={rating !== null}
        />
        <FeedbackButton
          label="הניתוח פספס"
          icon={<ThumbsDown className="h-4 w-4" />}
          selected={rating === "down"}
          dimmed={rating === "up"}
          onClick={() => vote("down")}
          disabled={rating !== null}
        />
      </div>
    </section>
  );
}

function FeedbackButton({
  label,
  icon,
  selected,
  dimmed,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  dimmed: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
        selected &&
          "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400",
        !selected &&
          !dimmed &&
          "border-border text-muted-foreground hover:bg-muted",
        dimmed && "border-border/50 text-muted-foreground/40",
      )}
    >
      {icon}
    </button>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (view: View) => void;
}) {
  const options: Array<{ key: View; label: string }> = [
    { key: "fixes", label: "מה לתקן" },
    { key: "score", label: "פירוט הציון" },
  ];

  return (
    <div className="ms-auto flex rounded-full border border-border p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          aria-pressed={view === option.key}
          className={cn(
            "rounded-full px-3 py-1 text-sm transition-colors",
            view === option.key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ fixes */

interface Fix {
  id: string;
  /** What to do. The primary line — this is what the reader acts on. */
  action: string;
  /** Why it matters. Absent on the synthesized keywords fix. */
  issue?: string;
  /** Missing keywords are rendered inline under their own fix. */
  keywords?: string[];
}

/** Red flags first — they are what a recruiter notices — then improvements. */
function buildFixes(results: CVAnalysisResultsType): Fix[] {
  const fixes: Fix[] = [
    ...results.red_flags.map((fix, i) => ({ id: `flag-${i}`, ...fix })),
    ...results.improvements.map((fix, i) => ({ id: `improve-${i}`, ...fix })),
  ];

  if (results.keywords_missing.length > 0) {
    fixes.push({
      id: "keywords",
      action: `שלבו את מילות המפתח מתיאור המשרה שחסרות במסמך (${results.keywords_missing.length}).`,
      keywords: results.keywords_missing,
    });
  }

  return fixes;
}

function FixListView({
  results,
  hasJobDescription,
  done,
  toggle,
  onShowScore,
}: {
  results: CVAnalysisResultsType;
  hasJobDescription: boolean;
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  onShowScore: () => void;
}) {
  const fixes = useMemo(() => buildFixes(results), [results]);
  const doneCount = fixes.filter((f) => done[f.id]).length;

  const [lead, ...rest] = fixes;

  if (!lead) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">אין מה לתקן</h2>
        <p className="text-muted-foreground">
          הניתוח לא מצא דגלים אדומים או נקודות לשיפור.{" "}
          <button
            type="button"
            onClick={onShowScore}
            className="underline underline-offset-4"
          >
            הציצו בפירוט הציון
          </button>
          .
        </p>
        <Strengths items={results.strengths} />
        <ConsultingCta />
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold sm:text-4xl">
          תתחילו מכאן. {fixes.length} שינויים, לפי סדר.
        </h2>
        <p className="text-muted-foreground">
          מסודר לפי מה שמגייס יראה קודם. סמנו מה שביצעתם כדי לא לאבד את המקום.
          {!hasJobDescription && (
            <> הוסיפו תיאור משרה כדי לקבל גם התאמה לדרישות ולמילות המפתח.</>
          )}
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">התקדמות ברשימה</span>
          <span dir="ltr" className="tabular-nums text-muted-foreground">
            {doneCount} / {fixes.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-green-500 transition-[width] duration-300"
            style={{ width: `${(doneCount / fixes.length) * 100}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggle(lead.id)}
        aria-pressed={!!done[lead.id]}
        className={cn(
          "block w-full rounded-2xl border p-6 text-start transition-colors",
          done[lead.id]
            ? "border-green-500/40 bg-green-500/5"
            : "border-border bg-muted/30 hover:bg-muted/50",
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          <Tick checked={!!done[lead.id]} />
          <span className="text-sm text-muted-foreground">התיקון הכי דחוף</span>
        </div>
        <p
          className={cn(
            "text-xl leading-snug",
            done[lead.id] && "text-muted-foreground line-through",
          )}
        >
          {lead.action}
        </p>
        {lead.issue && (
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-muted-foreground",
              done[lead.id] && "text-muted-foreground/50",
            )}
          >
            {lead.issue}
          </p>
        )}
      </button>

      {rest.length > 0 && (
        <ol className="divide-y divide-border border-y border-border">
          {rest.map((fix, i) => (
            <li key={fix.id}>
              <button
                type="button"
                onClick={() => toggle(fix.id)}
                aria-pressed={!!done[fix.id]}
                className="flex w-full items-start gap-4 py-4 text-start hover:bg-muted/40"
              >
                <Tick checked={!!done[fix.id]} />
                <span className="w-6 shrink-0 pt-0.5 font-mono text-sm tabular-nums text-muted-foreground">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="flex-1 space-y-1.5">
                  <span
                    className={cn(
                      "block text-sm font-medium leading-relaxed",
                      done[fix.id] && "text-muted-foreground line-through",
                    )}
                  >
                    {fix.action}
                  </span>
                  {fix.issue && (
                    <span
                      className={cn(
                        "block text-xs leading-relaxed text-muted-foreground",
                        done[fix.id] && "text-muted-foreground/50",
                      )}
                    >
                      {fix.issue}
                    </span>
                  )}
                  {fix.keywords && (
                    <span className="flex flex-wrap gap-1.5">
                      {fix.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <ConsultingCta />
      <Strengths items={results.strengths} />
    </div>
  );
}

function Tick({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        checked
          ? "border-green-500 bg-green-500"
          : "border-muted-foreground/40",
      )}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" />}
    </span>
  );
}

function Strengths({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        מה כבר עובד — אל תיגעו בזה
      </h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ score */

function verdict(ratio: number) {
  if (ratio >= 0.75)
    return { word: "מוכנים לשלוח", note: "הקורות חיים עומדים בפני עצמם." };
  if (ratio >= 0.5)
    return { word: "כמעט שם", note: "הבסיס טוב, הניסוח מוריד לכם נקודות." };
  if (ratio >= 0.3)
    return { word: "צריך עבודה", note: "יש חומר גלם, הוא לא מגיע לקורא." };
  return { word: "לא עובר סינון", note: "ברוב המשרות זה ייעצר בשלב הראשון." };
}

function ScoreView({
  results,
  hasJobDescription,
}: {
  results: CVAnalysisResultsType;
  hasJobDescription: boolean;
}) {
  const { dimensions, total, reachable } = scoreTotals(
    results,
    hasJobDescription,
  );
  const { word, note } = verdict(total / reachable);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h2 className="text-4xl font-bold leading-tight sm:text-5xl">{word}</h2>
        <p className="text-lg text-muted-foreground">{note}</p>
      </header>

      {/* One track carrying the total and the rubric breakdown at once: each
          dimension owns a slice proportional to its maximum points. */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between text-sm text-muted-foreground">
          <span dir="ltr">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {total}
            </span>
            <span className="text-lg tabular-nums"> / {reachable}</span>
          </span>
          <span>{dimensions.length} מדדים, משוקללים לפי משקלם</span>
        </div>

        <div className="flex h-16 w-full overflow-hidden rounded-lg bg-muted/40 ring-1 ring-border">
          {dimensions.map((d) => {
            const score = results.scores[d.key];
            const share = d.max / reachable;
            return (
              <div
                key={d.key}
                title={`${d.label}: ${score}/${d.max}`}
                style={{ width: `${share * 100}%` }}
                className="relative border-e border-background/60 last:border-e-0"
              >
                <div
                  className="flex h-full items-center overflow-hidden bg-green-500 ps-2"
                  style={{ width: `${(score / d.max) * 100}%` }}
                >
                  {/* Narrow slices cannot hold a number legibly on mobile —
                      their value is in the table below. */}
                  {share >= 0.08 && (
                    <span className="text-sm font-bold tabular-nums text-white">
                      {score}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels truncate to noise under ~640px; the table below carries them */}
        <div className="hidden text-[10px] text-muted-foreground sm:flex">
          {dimensions.map((d) => (
            <span
              key={d.key}
              style={{ width: `${(d.max / reachable) * 100}%` }}
              className="truncate ps-1 text-start"
            >
              {d.max / reachable >= 0.08 ? `${d.short} · ${d.max}` : ""}
            </span>
          ))}
        </div>

        {!hasJobDescription && (
          <p className="text-xs text-muted-foreground">
            ללא תיאור משרה נמדדת רק איכות המסמך. הוסיפו תיאור משרה כדי לפתוח את
            דרישות החובה ומילות המפתח — עוד {100 - reachable} נקודות.
          </p>
        )}
      </section>

      <section className="divide-y divide-border border-y border-border">
        {dimensions.map((d) => {
          const gap = d.max - results.scores[d.key];
          return (
            <div key={d.key} className="flex items-center gap-4 py-3 text-sm">
              <span className="flex-1 font-medium">{d.label}</span>
              <span dir="ltr" className="tabular-nums text-muted-foreground">
                {results.scores[d.key]}/{d.max}
              </span>
              <span
                className={cn(
                  "w-24 text-end tabular-nums",
                  gap === 0 ? "text-green-600 dark:text-green-400" : "",
                )}
              >
                {gap === 0 ? "מלא" : `חסרות ${gap}`}
              </span>
            </div>
          );
        })}
      </section>

      <Keywords
        found={results.keywords_found}
        missing={hasJobDescription ? results.keywords_missing : []}
      />

      <Strengths items={results.strengths} />
      <ConsultingCta />
    </div>
  );
}

function Keywords({ found, missing }: { found: string[]; missing: string[] }) {
  if (found.length === 0 && missing.length === 0) return null;
  return (
    <section className="grid gap-6 sm:grid-cols-2">
      {found.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">מילות מפתח שנמצאו</h3>
          <div className="flex flex-wrap gap-1.5">
            {found.map((keyword) => (
              <span
                key={keyword}
                className="rounded-md bg-green-500/15 px-2 py-1 text-xs text-green-700 dark:text-green-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">מופיעות במשרה, חסרות אצלכם</h3>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((keyword) => (
              <span
                key={keyword}
                className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ConsultingCta() {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-muted/30 p-6">
      <h3 className="text-lg font-semibold">נעבור על זה יחד?</h3>
      <p className="text-sm text-muted-foreground">
        פגישת ייעוץ אישית שבה ננסח מחדש כל בולט שמופיע כאן ונהפוך אותו להישג
        מדיד.
      </p>
      <CVConsultingButton />
    </section>
  );
}

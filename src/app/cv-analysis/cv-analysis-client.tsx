"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { track } from "@/services/analytics";
import type { CVAnalysisResults as CVAnalysisResultsType } from "@/types/cv-analysis";
import { CheckCircle2, Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  type StoredAnalysis,
  clearAnalysis,
  loadAnalysis,
  saveAnalysis,
} from "./analysis-storage";
import { CVAnalysisResults } from "./cv-analysis-results";
import { FileUpload } from "./file-upload";

interface AnalysisState {
  file: File | null;
  jobDescription: string;
  results: CVAnalysisResultsType | null;
  /**
   * Whether the *displayed* analysis was run against a job description. Kept
   * apart from `jobDescription` because a restored analysis has results without
   * the pasted text, and the score breakdown depends on this flag.
   */
  hasJobDescription: boolean;
  isLoading: boolean;
  error: string | null;
}

const emptyState: AnalysisState = {
  file: null,
  jobDescription: "",
  results: null,
  hasJobDescription: false,
  isLoading: false,
  error: null,
};

export function CVAnalysisClient() {
  const [state, setState] = useState<AnalysisState>(emptyState);
  /**
   * Progress restored from a previous visit, handed to the results view as its
   * initial state. Null until the storage read runs — reading localStorage
   * during render would not match the server-rendered HTML.
   */
  const [restored, setRestored] = useState<StoredAnalysis | null>(null);

  useEffect(() => {
    const stored = loadAnalysis();
    if (!stored) return;
    setRestored(stored);
    setState((prev) => ({
      ...prev,
      results: stored.results,
      hasJobDescription: stored.hasJobDescription,
    }));
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file) {
      track("cv_file_selected", {
        file_size_kb: Math.round(file.size / 1024),
        file_extension: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
        has_job_description: !!state.jobDescription,
      });
    }
    setState((prev) => ({ ...prev, file }));
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setState((prev) => ({ ...prev, jobDescription: e.target.value }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const resetAnalysis = () => {
    track("cv_analysis_reset", {
      had_results: !!state.results,
      had_error: !!state.error,
    });
    clearAnalysis();
    setRestored(null);
    setState(emptyState);
  };

  const analyzeCv = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.file) {
      setError("נא להעלות קורות חיים");
      return;
    }

    setState((prev) => ({ ...prev, error: null, isLoading: true }));

    try {
      const formData = new FormData();
      formData.append("cv", state.file);

      if (state.jobDescription) {
        formData.append("jobDescription", state.jobDescription);
      }

      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ?? errorData.error ?? "ניתוח קורות החיים נכשל",
        );
      }

      const data = await response.json();
      const hasJobDescription = !!state.jobDescription;
      // A fresh analysis replaces whatever was stored, progress included.
      setRestored(null);
      saveAnalysis({ results: data.object, hasJobDescription });
      setState((prev) => ({
        ...prev,
        results: data.object,
        hasJobDescription,
        isLoading: false,
      }));
      track("cv_analyzed", {
        has_job_description: !!state.jobDescription,
      });
    } catch (err) {
      const error_message = err instanceof Error ? err.message : "אירעה שגיאה";
      track("cv_analysis_error", {
        error_message,
        has_job_description: !!state.jobDescription,
      });
      setState((prev) => ({
        ...prev,
        error: error_message,
        isLoading: false,
      }));
    }
  };

  if (state.results) {
    return (
      <div className="container max-w-4xl space-y-6 py-8">
        <CVAnalysisResults
          results={state.results}
          hasJobDescription={state.hasJobDescription}
          initialDone={restored?.done}
          initialRating={restored?.rating ?? null}
        />
        <div className="flex justify-center">
          <Button onClick={resetAnalysis} variant="outline" className="mt-4">
            נתח קורות חיים נוספים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {/* Brand-blue wash behind the hero, over a faint grid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_100%_at_50%_0%,theme(colors.blue.900/35%),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="relative container max-w-3xl px-4 pt-14 pb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">
          <Sparkles className="h-3.5 w-3.5" />
          ניתוח מבוסס AI · חינם
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl">
          ניתוח קורות חיים חכם
          <br />
          עברו את מערכות ה-ATS בהצלחה
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          רוב המעסיקים מסננים מועמדים דרך מערכת ATS לפני שאדם רואה את הקובץ.
          העלו את קורות החיים וקבלו את הציון שלכם ב-30 שניות.
        </p>

        <form onSubmit={analyzeCv} className="mt-10">
          <FileUpload
            file={state.file}
            onFileChange={handleFileChange}
            onError={setError}
          />

          <details className="mx-auto mt-4 max-w-xl text-start">
            <summary className="cursor-pointer list-none text-sm text-slate-300 hover:underline">
              + הוסיפו תיאור משרה לתוצאות מדויקות יותר (אופציונלי)
            </summary>
            <Textarea
              id="jobDescription"
              value={state.jobDescription}
              onChange={handleJobDescriptionChange}
              placeholder="הדביקו כאן את תיאור המשרה..."
              className="mt-3 min-h-[120px] resize-y"
            />
          </details>

          <Button
            type="submit"
            disabled={state.isLoading || !state.file}
            size="lg"
            className="mt-6 w-full bg-blue-900 text-white hover:bg-blue-800 sm:w-auto"
          >
            {state.isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                מנתח קורות חיים...
              </span>
            ) : (
              "נתח קורות חיים"
            )}
          </Button>

          {state.error && (
            <Alert variant="destructive" className="mt-6 text-start">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {["ללא הרשמה", "תוצאה ב-30 שניות", "הקובץ לא נשמר"].map((label) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-slate-300" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

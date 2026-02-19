"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CVAnalysisResults } from "./cv-analysis-results";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { FileUpload } from "./file-upload";
import { SeoContent } from "./seo-content";
import { track } from "@/services/analytics";

interface AnalysisState {
  file: File | null;
  jobDescription: string;
  results: any | null;
  isLoading: boolean;
  error: string | null;
}

export function CVAnalysisClient() {
  const [state, setState] = useState<AnalysisState>({
    file: null,
    jobDescription: "",
    results: null,
    isLoading: false,
    error: null,
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      track("cv_file_selected", {
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        has_job_description: !!state.jobDescription,
      });
    }
    setState((prev) => ({ ...prev, file }));
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
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
    setState({
      file: null,
      jobDescription: "",
      results: null,
      isLoading: false,
      error: null,
    });
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
        const errorData = await response.json();
        throw new Error(errorData.message || "ניתוח קורות החיים נכשל");
      }

      const data = await response.json();
      setState((prev) => ({ ...prev, results: data.object, isLoading: false }));
      track("cv_analyzed", {
        has_job_description: !!state.jobDescription,
        file_name: state.file?.name,
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

  return (
    <div>
      {state.results ? (
        <div className="space-y-6">
          <CVAnalysisResults
            results={state.results}
            hasJobDescription={!!state.jobDescription}
          />
          <div className="flex justify-center">
            <Button onClick={resetAnalysis} variant="outline" className="mt-4">
              נתח קורות חיים נוספים
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-6 border-2 border-border shadow-lg rounded-xl bg-gradient-to-b from-background to-muted/30">
          <form onSubmit={analyzeCv} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUpload
                file={state.file}
                onFileChange={handleFileChange}
                onError={setError}
              />

              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-lg font-medium">
                  תיאור המשרה{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    (אופציונלי)
                  </span>
                </Label>
                <Textarea
                  id="jobDescription"
                  value={state.jobDescription}
                  onChange={handleJobDescriptionChange}
                  placeholder="הדבק את תיאור המשרה כאן לקבלת תוצאות מדויקות יותר..."
                  className="min-h-[120px] resize-y"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={state.isLoading || !state.file}
                className="w-full sm:w-auto"
                size="lg"
              >
                {state.isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Spinner />
                    <span>מנתח קורות חיים...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4 mr-2" />
                    נתח קורות חיים
                  </div>
                )}
              </Button>
            </div>

            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}

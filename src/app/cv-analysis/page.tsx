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

interface AnalysisState {
  file: File | null;
  jobDescription: string;
  results: any | null;
  isLoading: boolean;
  error: string | null;
}

export default function CVAnalysisPage() {
  const [state, setState] = useState<AnalysisState>({
    file: null,
    jobDescription: "",
    results: null,
    isLoading: false,
    error: null,
  });

  const handleFileChange = (file: File | null) => {
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
        throw new Error("ניתוח קורות החיים נכשל");
      }

      const data = await response.json();
      setState((prev) => ({ ...prev, results: data.object, isLoading: false }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "אירעה שגיאה",
        isLoading: false,
      }));
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        כלי לניתוח קורות חיים
      </h1>

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

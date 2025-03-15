"use client";

import type React from "react";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CVAnalysisResults } from "./cv-analysis-results";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CVAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const analyzeCv = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!file) {
        throw new Error("Please upload a CV");
      }

      if (debugMode) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock response
        setResults({
          match_percentage: jobDescription ? 75 : 50,
          strengths: [
            "Strong technical background",
            "Relevant project experience",
            "Good communication skills",
          ],
          improvements: [
            "Add more quantifiable achievements",
            jobDescription
              ? "Include specific technologies mentioned in job description"
              : "Consider adding more industry-specific keywords",
            "Highlight leadership experience",
          ],
          keywords_found: ["React", "TypeScript", "Node.js"],
          keywords_missing: ["Docker", "AWS", "CI/CD"],
        });
      } else {
        const formData = new FormData();
        formData.append("cv", file);
        if (jobDescription) {
          formData.append("jobDescription", jobDescription);
        }

        const response = await fetch("/api/analyze-cv", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to analyze CV");
        }

        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">CV Analysis Tool</h1>

      {results ? (
        <div className="space-y-6">
          <CVAnalysisResults results={results} />
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setResults(null);
                setFile(null);
                setJobDescription("");
              }}
              variant="outline"
              className="mt-4"
            >
              Analyze Another CV
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-6 border-2 border-border shadow-lg rounded-xl bg-gradient-to-b from-background to-muted/30">
          <form onSubmit={analyzeCv} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cv" className="text-lg font-medium">
                Upload CV (PDF)
              </Label>
              <Input
                id="cv"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="cv"
                className="block border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium">{file.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                    >
                      Change file
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-muted p-3 rounded-full">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Drag and drop your CV here, or click to browse
                    </p>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={(e) => e.preventDefault()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription" className="text-lg font-medium">
                Job Description{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get more accurate results..."
                className="min-h-[150px] resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                type="submit"
                disabled={loading || !file}
                className="w-full sm:w-auto"
                size="lg"
              >
                {loading ? (
                  "Analyzing..."
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze CV
                  </>
                )}
              </Button>

              <label className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="w-4 h-4"
                />
                Debug Mode
              </label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}

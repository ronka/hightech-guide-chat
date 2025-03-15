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
        throw new Error("נא להעלות קורות חיים");
      }

      if (debugMode) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setResults({
          match_percentage: jobDescription ? 75 : 50,
          strengths: [
            "רקע טכני חזק",
            "ניסיון בפרויקטים רלוונטיים",
            "כישורי תקשורת טובים",
          ],
          improvements: [
            "הוסף הישגים כמותיים",
            jobDescription
              ? "כלול טכנולוגיות ספציפיות שמוזכרות בתיאור המשרה"
              : "שקול להוסיף מילות מפתח ספציפיות לתעשייה",
            "הדגש ניסיון בהובלה",
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
          throw new Error("ניתוח קורות החיים נכשל");
        }

        const data = await response.json();
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        כלי לניתוח קורות חיים
      </h1>

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
              נתח קורות חיים נוספים
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-6 border-2 border-border shadow-lg rounded-xl bg-gradient-to-b from-background to-muted/30">
          <form onSubmit={analyzeCv} className="space-y-6">
            {/* 2 columns on large screens and one column on small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cv" className="text-lg font-medium">
                  העלה קורות חיים (PDF)
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
                        החלף קובץ
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-muted p-3 rounded-full">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        גרור ושחרר את קורות החיים כאן, או לחץ לבחירה
                      </p>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={(e) => e.preventDefault()}
                      >
                        בחר קובץ
                      </Button>
                    </div>
                  )}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-lg font-medium">
                  תיאור המשרה{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    (אופציונלי)
                  </span>
                </Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="הדבק את תיאור המשרה כאן לקבלת תוצאות מדויקות יותר..."
                  className="min-h-[165px] resize-y"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={loading || !file}
                className="w-full sm:w-auto"
                size="lg"
              >
                {loading ? (
                  "מנתח..."
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    נתח קורות חיים
                  </>
                )}
              </Button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Input
                type="checkbox"
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                className="w-4 h-4"
              />
              מצב דיבאג
            </label>

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

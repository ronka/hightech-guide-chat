import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/services/utils";
import { Progress } from "@/components/ui/progress";
import { CVAnalysisResults as CVAnalysisResultsType } from "@/types/cv-analysis";
import { CVConsultingButton } from "@/components/landing-page/buttons";

interface CVAnalysisResultsProps {
  results: CVAnalysisResultsType;
  className?: string;
  hasJobDescription?: boolean;
}

export function CVAnalysisResults({
  results,
  className,
  hasJobDescription,
}: CVAnalysisResultsProps) {
  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-2xl font-semibold mb-6">תוצאות ניתוח</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">ציון התאמה</span>
            <span className="text-sm font-medium">
              {results.match_percentage}%
            </span>
          </div>
          <Progress value={results.match_percentage} className="h-2" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              חוזקות
            </h3>
            <ul className="space-y-2">
              {results.strengths.map((strength, index) => (
                <li key={index} className="text-sm">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              תחומים לשיפור
            </h3>
            <ul className="space-y-2">
              {results.improvements.map((improvement, index) => (
                <li key={index} className="text-sm">
                  • {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              מילות מפתח שנמצאו
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.keywords_found.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {hasJobDescription && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                מילות מפתח חסרות
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.keywords_missing.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">
              רוצים לשפר את קורות החיים שלכם?
            </h3>
            <p className="text-muted-foreground">
              קבעו פגישת ייעוץ אישית איתי ואעזור לכם להפוך את קורות החיים שלכם
              למושכים יותר עבור מגייסים
            </p>
          </div>
          <CVConsultingButton />
        </div>
      </div>
    </Card>
  );
}

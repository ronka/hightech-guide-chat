import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuestionCardProps {
    question: {
        id: number
        title: { he: string; en: string }
        difficulty: string
        description: { he: string; en: string }
    }
}

export function QuestionCard({ question }: QuestionCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "קל":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "בינוני":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "קשה":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{question.title["he"]}</CardTitle>
                        <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        שאלה #{question.id}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-foreground leading-relaxed">{question.description["he"]}</p>
                </div>
            </CardContent>
        </Card>
    )
}

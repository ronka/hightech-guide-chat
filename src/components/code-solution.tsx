"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check } from "lucide-react"

interface CodeSolutionProps {
    solutions?: {
        python?: string
        javascript?: string
        java?: string
        cpp?: string
        [key: string]: string | undefined
    }
}

export function CodeSolution({ solutions }: CodeSolutionProps) {
    const availableSolutions = solutions ? Object.entries(solutions).filter(([_, code]) => code && code.trim()) : []

    const [selectedLang, setSelectedLang] = useState<string>(
        availableSolutions.length > 0 ? availableSolutions[0][0] : "python",
    )
    const [copied, setCopied] = useState(false)

    const languages: Record<string, { name: string; color: string }> = {
        python: { name: "Python", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
        javascript: { name: "JavaScript", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
        java: { name: "Java", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
        cpp: { name: "C++", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
    }

    const copyToClipboard = async () => {
        try {
            if (solutions && solutions[selectedLang]) {
                await navigator.clipboard.writeText(solutions[selectedLang]!)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (err) {
            console.error("Failed to copy code:", err)
        }
    }

    if (!solutions || availableSolutions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">פתרון קוד</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">אין פתרונות זמינים לשאלה זו</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">פתרון קוד</CardTitle>
                    <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2 bg-transparent">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "הועתק!" : "העתק"}
                    </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {availableSolutions.map(([key, _]) => (
                        <Badge
                            key={key}
                            variant={selectedLang === key ? "default" : "secondary"}
                            className={`cursor-pointer transition-colors ${selectedLang === key
                                    ? ""
                                    : languages[key]?.color || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                            onClick={() => setSelectedLang(key)}
                        >
                            {languages[key]?.name || key.toUpperCase()}
                        </Badge>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm" dir="ltr">
                        <code className={`language-${selectedLang}`}>{solutions[selectedLang] || ""}</code>
                    </pre>
                </div>
            </CardContent>
        </Card>
    )
}

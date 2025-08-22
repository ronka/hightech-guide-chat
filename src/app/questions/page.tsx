"use client"

import { useState, Dispatch, SetStateAction } from "react"
import { type QuestionListItem } from "@/types/questions"
import { useQuestionsQuery } from "@/hooks/useQuestionsQuery"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

type Question = QuestionListItem

const categories = ["הכל", "מערכים", "מחרוזות", "רשימות מקושרות", "עצים", "גרפים", "מחסנית"]
const difficulties = ["הכל", "קל", "בינוני", "קשה"]

interface FiltersProps {
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  categories: string[]
  selectedCategory: string
  setSelectedCategory: Dispatch<SetStateAction<string>>
  difficulties: string[]
  selectedDifficulty: string
  setSelectedDifficulty: Dispatch<SetStateAction<string>>
}

function QuestionsFilters({
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  setSelectedCategory,
  difficulties,
  selectedDifficulty,
  setSelectedDifficulty,
}: FiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="חפש שאלה..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter */}
      <div>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-700"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function QuestionsDirectory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("הכל")
  const [selectedDifficulty, setSelectedDifficulty] = useState("הכל")

  const { data: questions = [], isLoading, isError } = useQuestionsQuery()

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.titleHe.includes(searchTerm) || question.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "הכל" || question.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "הכל" || question.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "קל":
        return "bg-green-100 text-green-800 border-green-200"
      case "בינוני":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "קשה":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div
        className=" flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="">טוען שאלות...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">אירעה שגיאה בטעינת השאלות</h3>
              <p className="">נא לנסות לרענן את הדף</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">מאגר שאלות מראיונות עבודה</h1>
              <p className="">עיין בכל השאלות הזמינות ומצא את הפתרון המושלם</p>
            </div>
          </div>

          {/* Search and Filters */}
          {/* <Card>
            <CardContent className="p-6">
              <QuestionsFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                difficulties={difficulties}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
              />
            </CardContent>
          </Card> */}
        </div>

        {/* Questions Grid */}
        <div className="grid gap-4">
          {filteredQuestions.map((question) => (
            <Link href={`/questions/${question.slug}`} key={question.slug}>
              <Card key={question.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Question Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold ">{question.title}</h3>
                          {question.solved && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                          <Badge variant="outline">{question.category}</Badge>
                          {question.source && (
                            <Badge variant="outline">מקור: {question.source}</Badge>
                          )}
                          {Array.isArray((question as any).companies) && (question as any).companies.length > 0 && (
                            <Badge variant="outline">נשאל ב: {(question as any).companies.join(", ")}</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      פתח שאלה
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredQuestions.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">לא נמצאו שאלות</h3>
              <p className="">נסה לשנות את מונחי החיפוש או המסננים</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">{questions.length}</div>
                <div className="text-sm ">סה&rdquo;כ שאלות</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{questions.filter((q) => q.solved).length}</div>
                <div className="text-sm ">נפתרו</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {questions.filter((q) => q.difficulty === "קל").length}
                </div>
                <div className="text-sm ">קלות</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {questions.filter((q) => q.difficulty === "קשה").length}
                </div>
                <div className="text-sm ">קשות</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}

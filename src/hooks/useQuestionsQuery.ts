"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { QuestionsResponseSchema, type QuestionsResponse } from "@/types/questions"

async function fetchQuestions(): Promise<QuestionsResponse> {
    const response = await fetch("/api/questions")
    if (!response.ok) {
        throw new Error("Failed to fetch questions")
    }
    const data = await response.json()
    return QuestionsResponseSchema.parse(data)
}

export function useQuestionsQuery(options?: Partial<UseQueryOptions<QuestionsResponse, Error>>) {
    return useQuery<QuestionsResponse, Error>({
        queryKey: ["questions-list"],
        queryFn: fetchQuestions,
        staleTime: 1000 * 60,
        ...options,
    })
}



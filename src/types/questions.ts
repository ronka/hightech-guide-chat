import { z } from "zod";

export const HebrewDifficultySchema = z.enum(["הכל", "קל", "בינוני", "קשה"]);
export const EnglishDifficultySchema = z.enum(["", "Easy", "Medium", "Hard"]);

export const QuestionListItemSchema = z.object({
    id: z.number(),
    title: z.string(),
    titleHe: z.string(),
    difficulty: HebrewDifficultySchema,
    difficultyEn: EnglishDifficultySchema,
    category: z.string(),
    categoryEn: z.string(),
    solved: z.boolean(),
    acceptance: z.string(),
    slug: z.string().min(1),
    source: z.string().optional(),
    companies: z.array(z.string()).optional(),
});
export type QuestionListItem = z.infer<typeof QuestionListItemSchema>;

export const QuestionsResponseSchema = z.array(QuestionListItemSchema);
export type QuestionsResponse = z.infer<typeof QuestionsResponseSchema>;

export const QuestionFrontmatterSchema = z.object({
    id: z.number().optional(),
    title: z.string().optional(),
    titleHe: z.string().optional(),
    difficulty: z.union([HebrewDifficultySchema, z.string()]).optional(),
    category: z.string().optional(),
    categoryHe: z.string().optional(),
    solved: z.boolean().optional(),
    acceptance: z.string().optional(),
    videoUrl: z.string().url().optional(),
    source: z.string().optional(),
    companies: z.array(z.string()).optional(),
});
export type QuestionFrontmatter = z.infer<typeof QuestionFrontmatterSchema>;



import z from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1),
  PINECONE_API_KEY: z.string().trim().min(1),
  PINECONE_INDEX_NAME: z.string().trim().min(1),
  INDEX_INIT_TIMEOUT: z.coerce.number().min(1),
  ARCJET_KEY: z.string().trim().min(1),
  UPSTASH_REDIS_REST_URL: z.string().trim().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);

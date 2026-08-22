import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";

const SITE_URL = "https://hightechguide.co.il";

const STATIC_ROUTES = [
  "",
  "/cv-analysis",
  "/cracking-the-job-interview",
  "/explain",
  "/questions",
  "/start-working-with-ai",
  "/links",
  "/chat",
  "/developers",
];

function listSlugs(dir: string, extension: string): string[] {
  const fullDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir)
    .filter((file) => file.endsWith(extension))
    .map((file) => file.slice(0, -extension.length));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    priority: route === "" ? 1 : 0.7,
  }));

  const wordEntries: MetadataRoute.Sitemap = listSlugs(
    "src/dictionary",
    ".mdx",
  ).map((slug) => ({
    url: `${SITE_URL}/explain/${slug}`,
    priority: 0.5,
  }));

  const questionEntries: MetadataRoute.Sitemap = listSlugs(
    "src/questions",
    ".mdx",
  ).map((slug) => ({
    url: `${SITE_URL}/questions/${slug}`,
    priority: 0.5,
  }));

  return [...staticEntries, ...wordEntries, ...questionEntries];
}

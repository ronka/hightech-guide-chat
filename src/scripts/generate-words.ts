import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Word {
  slug: string;
  title: string;
  acronym: string;
  definition: string;
  category: string;
}

async function generateWordsFile() {
  try {
    // Get all MDX files from the dictionary directory
    const dictionaryPath = path.join(dirname(__dirname), "src", "dictionary");
    const files = await fs.readdir(dictionaryPath);
    const mdxFiles = files.filter((file) => file.endsWith(".mdx"));

    // Parse each MDX file and extract the required information
    const words: Word[] = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(dictionaryPath, file);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        return {
          slug: file.replace(".mdx", ""),
          title: data.title,
          acronym: data.acronym || "",
          definition: content.trim(),
          category: data.category,
        };
      })
    );

    // Generate the words.ts file content
    const fileContent = `/*
 * This file is auto-generated. Do not edit directly.
 * To update this file, run the generate-words script.
 */

export const words = ${JSON.stringify(words, null, 2)};
`;

    // Write the generated content to words.ts
    const wordsFilePath = path.join(
      dirname(__dirname),
      "src",
      "lib",
      "words.ts"
    );
    await fs.writeFile(wordsFilePath, fileContent, "utf-8");

    console.log("Successfully generated words.ts file!");
  } catch (error) {
    console.error("Error generating words.ts file:", error);
    process.exit(1);
  }
}

generateWordsFile();

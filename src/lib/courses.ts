import fs from "fs";
import path from "path";
import matter from "gray-matter";

const coursesDir = path.join(process.cwd(), "src/courses");

export interface CourseMeta {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
}

export interface Attachment {
  name: string;
  file: string;
}

export interface LessonMeta {
  slug: string;
  title: string;
  description?: string;
  youtube?: string;
  attachments?: Attachment[];
  duration?: string;
}

export interface Module {
  slug: string;
  title?: string;
  lessons: LessonMeta[];
}

export interface Lesson extends LessonMeta {
  content: string;
}

export interface Course extends CourseMeta {
  content: string;
  modules: Module[];
}

function parseCourseIndex(dir: string, slug: string): CourseMeta {
  const filePath = path.join(dir, "index.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    coverImage: data.coverImage,
  };
}

function parseLessonFile(filePath: string): LessonMeta {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const filename = path.basename(filePath, ".md");
  return {
    slug: filename,
    title: data.title ?? filename,
    description: data.description,
    youtube: data.youtube,
    attachments: data.attachments ?? [],
    duration: data.duration,
  };
}

function getModules(courseDir: string): Module[] {
  const entries = fs.readdirSync(courseDir, { withFileTypes: true });
  const moduleDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  return moduleDirs.map((moduleSlug) => {
    const moduleDir = path.join(courseDir, moduleSlug);
    const lessonFiles = fs
      .readdirSync(moduleDir)
      .filter((f) => f.endsWith(".md") && f !== "index.md")
      .sort((a, b) => {
        const numA = parseInt(a.split("-")[0], 10) || 0;
        const numB = parseInt(b.split("-")[0], 10) || 0;
        return numA - numB;
      });

    const lessons = lessonFiles.map((filename) =>
      parseLessonFile(path.join(moduleDir, filename))
    );

    const moduleIndexPath = path.join(moduleDir, "index.md");
    let title: string | undefined;
    if (fs.existsSync(moduleIndexPath)) {
      const { data } = matter(fs.readFileSync(moduleIndexPath, "utf-8"));
      title = data.title;
    }

    return { slug: moduleSlug, title, lessons };
  });
}

export function getAllCourses(): CourseMeta[] {
  if (!fs.existsSync(coursesDir)) return [];
  const slugs = fs.readdirSync(coursesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  return slugs.map((slug) =>
    parseCourseIndex(path.join(coursesDir, slug), slug)
  );
}

export function getCourseBySlug(slug: string): Course {
  const courseDir = path.join(coursesDir, slug);
  const filePath = path.join(courseDir, "index.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    coverImage: data.coverImage,
    content,
    modules: getModules(courseDir),
  };
}

export function getLessonBySlug(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Lesson {
  const filePath = path.join(
    coursesDir,
    courseSlug,
    moduleSlug,
    `${lessonSlug}.md`
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug: lessonSlug,
    title: data.title ?? lessonSlug,
    description: data.description,
    youtube: data.youtube,
    attachments: data.attachments ?? [],
    content,
  };
}

"use client";

import { useState, useMemo, useCallback, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Word } from "@/scripts/generate-words";
import { words } from "@/lib/words";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { track } from "@/services/analytics";

const ITEMS_PER_PAGE = 9;

function getSimilarWords(
  searchTerm: string,
  allWords: Word[],
  maxResults = 3
): Word[] {
  if (!searchTerm) return [];

  return words
    .map((word) => ({
      word,
      similarity: Math.max(
        word.title
          .toLowerCase()
          .split("")
          .filter((char, i) => char === searchTerm.toLowerCase()[i]).length /
          Math.max(word.title.length, searchTerm.length),
        word.definition
          .toLowerCase()
          .includes(searchTerm.toLowerCase().slice(0, -1))
          ? 0.8
          : 0,
        word.title.toLowerCase().includes(searchTerm.toLowerCase().slice(0, -1))
          ? 0.9
          : 0
      ),
    }))
    .filter(({ similarity }) => similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults)
    .map(({ word }) => word);
}

function WordsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(search);

  const filteredWords = useMemo(
    () =>
      words.filter(
        (word) =>
          word.acronym.toLowerCase().includes(search.toLowerCase()) ||
          word.slug.toLowerCase().includes(search.toLowerCase()) ||
          word.title.toLowerCase().includes(search.toLowerCase()) ||
          word.definition.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const similarWords = useMemo(
    () => (filteredWords.length === 0 ? getSimilarWords(search, words) : []),
    [search, filteredWords.length]
  );

  const debouncedUpdateUrl = useDebouncedCallback((value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
        track("dictionary_searched", { search_term: value, results_count: filteredWords.length });
      } else {
        params.delete("search");
      }
      router.replace(`/explain?${params.toString()}`);
    });
  }, 300);

  const handleSearch = useCallback(
    (value: string) => {
      setLocalSearch(value);
      setCurrentPage(1);
      debouncedUpdateUrl(value);
    },
    [debouncedUpdateUrl]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className="text-3xl font-bold mb-6 hover:cursor-pointer hover:text-primary/80 transition-colors"
        onClick={() => handleSearch("")}
      >
        מילון מושגים
      </h1>
      <div className="mb-6 flex gap-2 items-center">
        <div className="relative flex-1 max-w-md">
          <Input
            type="search"
            placeholder="חפש מילה במילון ..."
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {localSearch && (
          <Button
            variant="outline"
            size="default"
            onClick={() => handleSearch("")}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            נקה חיפוש
          </Button>
        )}
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground mb-4">מחפש...</div>
      )}

      {filteredWords.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {paginatedWords.map((word: Word) => (
              <Link href={`/explain/${word.slug}`} key={word.slug}>
                <Card className="h-full hover:bg-accent transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{word.title}</CardTitle>
                      <Badge variant="secondary">{word.category}</Badge>
                    </div>
                    <CardDescription>{word.acronym}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3">{word.definition}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            מראה {paginatedWords.length} מתוך {filteredWords.length} מושגים
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <Card className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-xl font-semibold text-muted-foreground">
                לא נמצאו תוצאות
              </p>
              <p className="text-sm text-muted-foreground">
                לא נמצאו מושגים התואמים לחיפוש &quot;{search}&quot;
              </p>
            </div>
          </Card>

          {similarWords.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-right">
                אולי התכוונת ל:
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {similarWords.map((word) => (
                  <Link href={`/explain/${word.slug}`} key={word.slug}>
                    <Card className="h-full hover:bg-accent transition-colors">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{word.title}</CardTitle>
                          <Badge variant="secondary">{word.category}</Badge>
                        </div>
                        <CardDescription>{word.acronym}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3">{word.definition}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WordsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">מילון מושגים</h1>
          <div className="text-sm text-muted-foreground">טוען...</div>
        </div>
      }
    >
      <WordsPageContent />
    </Suspense>
  );
}

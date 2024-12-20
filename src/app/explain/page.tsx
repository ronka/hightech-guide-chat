"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { words } from "@/lib/words";

const ITEMS_PER_PAGE = 9;

export default function WordsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const filteredWords = words.filter(
    (word) =>
      word.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">מילון מושגים</h1>
      <div className="mb-6">
        <Input
          type="search"
          placeholder="חפש מילה במילון ..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-md"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {paginatedWords.map((word) => (
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
    </div>
  );
}

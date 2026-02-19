"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { track } from "@/services/analytics";

interface WordActionsProps {
  slug: string;
  title: string;
}

export function WordActions({ slug, title }: WordActionsProps) {
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = async () => {
    if (hasLiked) return;

    try {
      setHasLiked(true);
      track("like_word", {
        slug,
        title,
      });
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-4">
      <Button
        variant={hasLiked ? "default" : "outline"}
        onClick={handleLike}
        disabled={hasLiked}
      >
        👍 {hasLiked ? "תודה" : "עזר לי"}
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          track("term_shared", { slug, title, method: typeof navigator.share === "function" ? "native_share" : "clipboard" });
          if (navigator.share) {
            navigator
              .share({
                title: title,
                text: `למד על ${title} במילון הטכנולוגי של המדריך להייטיקיסט המתחיל`,
                url: window.location.href,
              })
              .catch(console.error);
          } else {
            navigator.clipboard
              .writeText(window.location.href)
              .then(() => {
                alert("הקישור הועתק ללוח!");
              })
              .catch(console.error);
          }
        }}
      >
        🔗 שיתוף
      </Button>
    </div>
  );
}

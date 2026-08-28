"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { checkoutUrl } from "@/services/checkout-attribution";

interface BuyButtonProps {
  children: React.ReactNode;
  href: string;
  onClick: () => void;
  size?: "default" | "xl";
}

function BuyButtonInner({
  children,
  href,
  onClick,
  size = "default",
}: BuyButtonProps) {
  const searchParams = useSearchParams();

  const getFullUrl = () => checkoutUrl(href, new URLSearchParams(searchParams.toString()));

  const baseClasses =
    "inline-flex items-center justify-center rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-base font-medium text-white shadow-lg transition-all duration-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 hover:animate-none relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent";

  const sizeClasses = size === "xl" ? "h-16 px-12 text-lg" : "h-12 px-8";

  return (
    <Link
      href={getFullUrl()}
      className={`${baseClasses} ${sizeClasses}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function BuyButton(props: BuyButtonProps) {
  return (
    <Suspense fallback={null}>
      <BuyButtonInner {...props} />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import {
  CHECKOUT_PRODUCTS,
  trackCheckout,
  type CheckoutProduct,
} from "@/services/checkout-analytics";

export function CheckoutLink({
  product,
  source,
  children,
  className,
  target,
}: {
  product: CheckoutProduct;
  source: string;
  children: React.ReactNode;
  className?: string;
  target?: "_blank";
}) {
  return (
    <Link
      href={CHECKOUT_PRODUCTS[product].href}
      className={className}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={() => trackCheckout(product, { source })}
    >
      {children}
    </Link>
  );
}

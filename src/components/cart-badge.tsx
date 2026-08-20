"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative flex items-center gap-1 text-sm font-medium">
      Cart
      {totalItems > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-700 px-1 text-xs font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

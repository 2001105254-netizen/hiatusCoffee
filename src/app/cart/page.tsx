"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, setQuantity, removeItem, totalPrice } = useCart();

  if (lines.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-stone-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-amber-800 hover:underline">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-6">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Your cart</h1>

      <ul className="flex flex-col gap-4">
        {lines.map((line) => (
          <li key={line.menuItemId} className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {line.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-stone-400">☕</div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-900">{line.name}</p>
              <p className="text-xs uppercase text-amber-800">{line.flavor}</p>
              <p className="text-sm text-stone-600">{formatPrice(line.price)}</p>
            </div>
            <div className="flex items-center rounded-full border border-stone-300">
              <button
                className="px-2.5 py-1 text-lg"
                onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{line.quantity}</span>
              <button
                className="px-2.5 py-1 text-lg"
                onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              className="text-xs text-stone-400 hover:text-red-600"
              onClick={() => removeItem(line.menuItemId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-full bg-stone-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-stone-700"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}

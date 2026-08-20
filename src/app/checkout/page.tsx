"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { placeOrder } from "@/app/actions/orders";

export default function CheckoutPage() {
  const { lines, totalPrice, clear } = useCart();
  const [pickupNote, setPickupNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (lines.length === 0) {
    return (
      <div className="py-10 text-center text-stone-600">
        Your cart is empty — nothing to check out.
      </div>
    );
  }

  const handlePlaceOrder = () => {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder(
        lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        pickupNote
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      clear();
      toast.success("Order placed! Pay cash on pickup.");
      router.push(`/orders/${result.orderId}`);
    });
  };

  return (
    <div className="mx-auto max-w-lg py-6">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Checkout</h1>

      <ul className="mb-4 flex flex-col gap-2 border-b border-stone-200 pb-4 text-sm">
        {lines.map((line) => (
          <li key={line.menuItemId} className="flex justify-between">
            <span>
              {line.quantity} × {line.name}
            </span>
            <span>{formatPrice(line.price * line.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mb-6 flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>

      <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Payment: cash on pickup. Please have the exact amount ready.
      </div>

      <div className="mb-6 flex flex-col gap-1">
        <label htmlFor="pickup_note" className="text-sm font-medium text-stone-700">
          Notes for the shop (optional)
        </label>
        <textarea
          id="pickup_note"
          value={pickupNote}
          onChange={(e) => setPickupNote(e.target.value)}
          rows={2}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          placeholder="e.g. oat milk instead of regular"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={pending}
        className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? "Placing order..." : "Place order"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/lib/cart-context";
import type { MenuItem } from "@/types/database";

export function AddToCart({ item }: { item: MenuItem }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-stone-300">
        <button
          className="px-3 py-1.5 text-lg"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{quantity}</span>
        <button
          className="px-3 py-1.5 text-lg"
          onClick={() => setQuantity((q) => q + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        className="flex-1 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!item.is_available}
        onClick={() => {
          addItem(
            {
              menuItemId: item.id,
              name: item.name,
              flavor: item.flavor,
              price: item.price,
              imageUrl: item.image_url,
            },
            quantity
          );
          toast.success(`Added ${quantity} × ${item.name} to cart`);
        }}
      >
        {item.is_available ? "Add to cart" : "Sold out"}
      </button>
    </div>
  );
}

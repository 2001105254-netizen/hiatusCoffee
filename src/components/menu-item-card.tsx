"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import type { MenuItem } from "@/types/database";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white">
      <Link href={`/menu/${item.id}`} className="block">
        <div className="aspect-square w-full bg-stone-100">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-stone-400">
              ☕
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/menu/${item.id}`}>
          <h3 className="font-serif text-base font-semibold text-stone-900">{item.name}</h3>
        </Link>
        <p className="text-xs uppercase tracking-wide text-amber-800">{item.flavor}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-medium text-stone-900">{formatPrice(item.price)}</span>
          <button
            className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!item.is_available}
            onClick={() => {
              addItem({
                menuItemId: item.id,
                name: item.name,
                flavor: item.flavor,
                price: item.price,
                imageUrl: item.image_url,
              });
              toast.success(`Added ${item.name} to cart`);
            }}
          >
            {item.is_available ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { StarRating } from "@/components/star-rating";
import type { MenuItem, Rating } from "@/types/database";
import { AddToCart } from "./add-to-cart";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .single<MenuItem>();

  if (!item) notFound();

  const { data: ratings } = await supabase
    .from("ratings")
    .select("*")
    .eq("menu_item_id", id)
    .order("created_at", { ascending: false })
    .returns<Rating[]>();

  const ratingList = ratings ?? [];
  const avgRating =
    ratingList.length > 0
      ? ratingList.reduce((sum, r) => sum + r.rating, 0) / ratingList.length
      : null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl text-stone-400">
            ☕
          </div>
        )}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-amber-800">{item.flavor}</p>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">{item.name}</h1>

        {avgRating !== null && (
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} readOnly size="sm" />
            <span className="text-sm text-stone-600">
              {avgRating.toFixed(1)} ({ratingList.length} rating{ratingList.length === 1 ? "" : "s"})
            </span>
          </div>
        )}

        <p className="mt-4 text-lg font-medium">{formatPrice(item.price)}</p>
        {item.description && <p className="mt-3 text-stone-600">{item.description}</p>}

        <div className="mt-6">
          <AddToCart item={item} />
        </div>

        <div className="mt-10">
          <h2 className="mb-3 font-serif text-xl font-semibold">Reviews</h2>
          {ratingList.length === 0 ? (
            <p className="text-sm text-stone-500">No reviews yet.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {ratingList.map((r) => (
                <li key={r.id} className="border-b border-stone-200 pb-3">
                  <StarRating value={r.rating} readOnly size="sm" />
                  {r.comment && <p className="mt-1 text-sm text-stone-700">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

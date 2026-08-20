import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MenuItemCard } from "@/components/menu-item-card";
import type { MenuItem } from "@/types/database";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ flavor?: string }>;
}) {
  const { flavor } = await searchParams;
  const supabase = await createClient();

  const { data: allItems } = await supabase
    .from("menu_items")
    .select("*")
    .order("name");

  const items = (allItems ?? []) as MenuItem[];
  const flavors = Array.from(new Set(items.map((i) => i.flavor))).sort();
  const visibleItems = flavor ? items.filter((i) => i.flavor === flavor) : items;

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-stone-900 px-6 py-10 text-white">
        <h1 className="font-serif text-3xl font-semibold">Hiatus</h1>
        <p className="mt-2 max-w-md text-stone-300">
          Order ahead, skip the line. Pay cash when you pick up.
        </p>
      </section>

      {flavors.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full px-3 py-1 text-sm ${
              !flavor ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-700"
            }`}
          >
            All
          </Link>
          {flavors.map((f) => (
            <Link
              key={f}
              href={`/?flavor=${encodeURIComponent(f)}`}
              className={`rounded-full px-3 py-1 text-sm ${
                flavor === f ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-700"
              }`}
            >
              {f}
            </Link>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <p className="text-stone-500">No menu items yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visibleItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

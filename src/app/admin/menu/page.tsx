import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/types/database";
import { DeleteButton } from "./delete-button";

export default async function AdminMenuPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .order("name")
    .returns<MenuItem[]>();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Menu items</h1>
        <Link
          href="/admin/menu/new"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Add item
        </Link>
      </div>

      {!items || items.length === 0 ? (
        <p className="text-stone-500">No menu items yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-stone-900">
                  {item.name}{" "}
                  {!item.is_available && (
                    <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-600">
                      Sold out
                    </span>
                  )}
                </p>
                <p className="text-xs uppercase text-amber-800">{item.flavor}</p>
                <p className="text-sm text-stone-600">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/admin/menu/${item.id}`}
                  className="text-sm font-medium text-amber-800 hover:underline"
                >
                  Edit
                </Link>
                <DeleteButton id={item.id} name={item.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

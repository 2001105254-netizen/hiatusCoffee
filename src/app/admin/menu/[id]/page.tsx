import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MenuItem } from "@/types/database";
import { MenuItemForm } from "../menu-item-form";

export default async function EditMenuItemPage({
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

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Edit {item.name}</h1>
      <MenuItemForm item={item} />
    </div>
  );
}

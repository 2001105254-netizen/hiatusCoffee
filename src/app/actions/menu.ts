"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type MenuFormState = { error: string | null };

export async function saveMenuItem(
  _prevState: MenuFormState,
  formData: FormData
): Promise<MenuFormState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const flavor = String(formData.get("flavor") ?? "").trim();
  const category = String(formData.get("category") ?? "coffee").trim();
  const price = Number(formData.get("price"));
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const isAvailable = formData.get("is_available") === "on";

  if (!name || !flavor || Number.isNaN(price) || price < 0) {
    return { error: "Name, flavor, and a valid price are required." };
  }

  const supabase = await createClient();
  const payload = {
    name,
    description: description || null,
    flavor,
    category,
    price,
    image_url: imageUrl || null,
    is_available: isAvailable,
  };

  const { error } = id
    ? await supabase.from("menu_items").update(payload).eq("id", id)
    : await supabase.from("menu_items").insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/admin/menu");
  revalidatePath("/");
  redirect("/admin/menu");
}

export async function deleteMenuItem(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { error: error?.message ?? null };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/database";

export async function placeOrder(
  items: { menuItemId: string; quantity: number }[],
  pickupNote: string
): Promise<{ orderId: string | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_order", {
    items: items.map((i) => ({ menu_item_id: i.menuItemId, quantity: i.quantity })),
    pickup_note: pickupNote || null,
  });

  if (error) {
    return { orderId: null, error: error.message };
  }

  revalidatePath("/orders");
  return { orderId: data as string, error: null };
}

export async function cancelOrder(orderId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_order", { target_order_id: orderId });

  revalidatePath("/orders");
  return { error: error?.message ?? null };
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_order_status", {
    target_order_id: orderId,
    new_status: newStatus,
  });

  revalidatePath("/admin/orders");
  return { error: error?.message ?? null };
}

export async function submitRating(
  orderId: string,
  menuItemId: string,
  rating: number,
  comment: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to leave a rating." };

  const { error } = await supabase.from("ratings").insert({
    user_id: user.id,
    order_id: orderId,
    menu_item_id: menuItemId,
    rating,
    comment: comment || null,
  });

  revalidatePath(`/orders/${orderId}`);
  return { error: error?.message ?? null };
}

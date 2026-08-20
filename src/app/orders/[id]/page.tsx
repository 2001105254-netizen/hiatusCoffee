import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice } from "@/lib/format";
import type { Order, OrderItem, Rating } from "@/types/database";
import { RatingForm } from "./rating-form";
import { CancelButton } from "./cancel-button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single<Order>();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .returns<OrderItem[]>();

  const { data: existingRatings } = await supabase
    .from("ratings")
    .select("*")
    .eq("order_id", id)
    .returns<Rating[]>();

  const ratedItemIds = new Set((existingRatings ?? []).map((r) => r.menu_item_id));

  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Order details</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <p className="mb-1 text-sm text-stone-600">
        {new Date(order.created_at).toLocaleString("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
      {order.pickup_note && (
        <p className="mb-4 text-sm italic text-stone-500">&ldquo;{order.pickup_note}&rdquo;</p>
      )}

      <ul className="mb-4 flex flex-col gap-2 border-y border-stone-200 py-4 text-sm">
        {(items ?? []).map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.quantity} × {item.item_name}
            </span>
            <span>{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mb-6 flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total_amount)}</span>
      </div>

      {order.status === "pending" && (
        <div className="mb-6">
          <CancelButton orderId={order.id} />
        </div>
      )}

      {order.status === "completed" && (
        <div>
          <h2 className="mb-3 font-serif text-lg font-semibold">Rate your order</h2>
          <div className="flex flex-col gap-3">
            {(items ?? [])
              .filter((item) => item.menu_item_id && !ratedItemIds.has(item.menu_item_id))
              .map((item) => (
                <RatingForm
                  key={item.id}
                  orderId={order.id}
                  menuItemId={item.menu_item_id!}
                  itemName={item.item_name}
                />
              ))}
            {(items ?? []).every((item) => !item.menu_item_id || ratedItemIds.has(item.menu_item_id)) && (
              <p className="text-sm text-stone-500">You&apos;ve rated everything in this order. Thanks!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

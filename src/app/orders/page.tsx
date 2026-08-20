import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/database";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  const orderList = orders ?? [];

  return (
    <div className="mx-auto max-w-lg py-6">
      <h1 className="mb-6 font-serif text-2xl font-semibold">My orders</h1>

      {orderList.length === 0 ? (
        <p className="text-stone-500">
          No orders yet.{" "}
          <Link href="/" className="text-amber-800 hover:underline">
            Browse the menu
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orderList.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 hover:border-stone-300"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {new Date(order.created_at).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-sm text-stone-600">{formatPrice(order.total_amount)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

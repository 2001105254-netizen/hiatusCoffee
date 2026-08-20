import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { OrderItem, OrderStatus } from "@/types/database";
import { StatusSelect } from "./status-select";

type OrderRow = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  pickup_note: string | null;
  created_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
  order_items: OrderItem[];
};

const TABS: { label: string; value: string }[] = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "All", value: "all" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "active" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, status, total_amount, pickup_note, created_at, profiles(full_name, phone), order_items(*)")
    .order("created_at", { ascending: false });

  if (tab === "active") query = query.in("status", ["pending", "preparing", "ready"]);
  else if (tab === "completed") query = query.eq("status", "completed");
  else if (tab === "cancelled") query = query.eq("status", "cancelled");

  const { data: orders } = await query.returns<OrderRow[]>();
  const orderList = orders ?? [];

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl font-semibold">Orders</h1>

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/admin/orders?tab=${t.value}`}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === t.value ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {orderList.length === 0 ? (
        <p className="text-stone-500">No orders here.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orderList.map((order) => (
            <li key={order.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-medium text-stone-900">
                    {order.profiles?.full_name ?? "Customer"}
                    {order.profiles?.phone && (
                      <span className="ml-2 text-sm font-normal text-stone-500">
                        {order.profiles.phone}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">
                    {new Date(order.created_at).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <StatusSelect orderId={order.id} status={order.status} />
              </div>

              <ul className="mb-2 text-sm text-stone-700">
                {order.order_items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.item_name}
                  </li>
                ))}
              </ul>

              {order.pickup_note && (
                <p className="mb-2 text-sm italic text-stone-500">&ldquo;{order.pickup_note}&rdquo;</p>
              )}

              <p className="text-sm font-semibold text-stone-900">{formatPrice(order.total_amount)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

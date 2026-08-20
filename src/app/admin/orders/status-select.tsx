"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateOrderStatus } from "@/app/actions/orders";
import type { OrderStatus } from "@/types/database";

const OPTIONS: OrderStatus[] = ["pending", "preparing", "ready", "completed", "cancelled"];

export function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={status}
      disabled={pending}
      className="rounded-lg border border-stone-300 px-2 py-1 text-sm disabled:opacity-50"
      onChange={(e) => {
        const newStatus = e.target.value as OrderStatus;
        startTransition(async () => {
          const result = await updateOrderStatus(orderId, newStatus);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(`Order marked ${newStatus}`);
          router.refresh();
        });
      }}
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

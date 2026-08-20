"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { cancelOrder } from "@/app/actions/orders";

export function CancelButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      onClick={() =>
        startTransition(async () => {
          const result = await cancelOrder(orderId);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Order cancelled");
          router.refresh();
        })
      }
    >
      {pending ? "Cancelling..." : "Cancel order"}
    </button>
  );
}

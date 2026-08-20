"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { deleteMenuItem } from "@/app/actions/menu";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      className="text-xs text-stone-400 hover:text-red-600 disabled:opacity-50"
      onClick={() => {
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
        startTransition(async () => {
          const result = await deleteMenuItem(id);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Deleted");
          router.refresh();
        });
      }}
    >
      Delete
    </button>
  );
}

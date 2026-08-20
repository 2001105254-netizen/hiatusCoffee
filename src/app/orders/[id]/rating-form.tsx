"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { StarRating } from "@/components/star-rating";
import { submitRating } from "@/app/actions/orders";

export function RatingForm({
  orderId,
  menuItemId,
  itemName,
}: {
  orderId: string;
  menuItemId: string;
  itemName: string;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return <p className="text-sm text-emerald-700">Thanks for rating {itemName}!</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-stone-200 p-3">
      <p className="text-sm font-medium text-stone-900">Rate {itemName}</p>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Optional comment"
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
      />
      <button
        disabled={rating === 0 || pending}
        className="self-start rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        onClick={() =>
          startTransition(async () => {
            const result = await submitRating(orderId, menuItemId, rating, comment);
            if (result.error) {
              toast.error(result.error);
              return;
            }
            setSubmitted(true);
          })
        }
      >
        {pending ? "Submitting..." : "Submit rating"}
      </button>
    </div>
  );
}

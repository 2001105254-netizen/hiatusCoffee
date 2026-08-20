"use client";

import { useState } from "react";

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const displayValue = hover ?? value;
  const starSize = size === "sm" ? "text-base" : "text-2xl";

  return (
    <div className={`flex gap-0.5 ${starSize}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <span className={star <= displayValue ? "text-amber-500" : "text-stone-300"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BestSellingFlavor } from "@/types/database";
import { BestSellerChart } from "./best-seller-chart";

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "All time", days: null },
];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = daysParam === undefined ? 30 : daysParam === "all" ? null : Number(daysParam);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("best_selling_flavors", { days_back: days });

  const flavors = (data ?? []) as BestSellingFlavor[];

  return (
    <div>
      <h1 className="mb-4 font-serif text-2xl font-semibold">Best-selling flavors</h1>

      <div className="mb-6 flex gap-2">
        {RANGES.map((r) => {
          const value = r.days === null ? "all" : String(r.days);
          const active = value === (daysParam ?? "30");
          return (
            <Link
              key={r.label}
              href={`/admin?days=${value}`}
              className={`rounded-full px-3 py-1 text-sm ${
                active ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-700"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : (
        <BestSellerChart data={flavors} />
      )}
    </div>
  );
}

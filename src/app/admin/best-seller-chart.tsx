"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";
import type { BestSellingFlavor } from "@/types/database";

const BAR_COLOR = "#92400e"; // amber-800, matches the shop's brand accent

export function BestSellerChart({ data }: { data: BestSellingFlavor[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-stone-500">No completed orders in this range yet.</p>;
  }

  const chartData = [...data].sort((a, b) => a.total_quantity - b.total_quantity);

  return (
    <div>
      <div style={{ height: Math.max(240, chartData.length * 44) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
            barCategoryGap={10}
          >
            <CartesianGrid horizontal={false} stroke="#e7e5e4" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "#78716c" }}
              axisLine={{ stroke: "#e7e5e4" }}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="flavor"
              width={110}
              tick={{ fontSize: 12, fill: "#44403c" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f5f5f4" }}
              formatter={(value) => [`${value} sold`, "Quantity"]}
              labelStyle={{ color: "#1c1917", fontWeight: 600 }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e7e5e4",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="total_quantity"
              fill={BAR_COLOR}
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="py-2 pr-4 font-medium">Flavor</th>
            <th className="py-2 pr-4 font-medium">Units sold</th>
            <th className="py-2 pr-4 font-medium">Orders</th>
            <th className="py-2 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {[...data]
            .sort((a, b) => b.total_quantity - a.total_quantity)
            .map((row, i) => (
              <tr key={row.flavor} className="border-b border-stone-100">
                <td className="whitespace-nowrap py-2 pr-4 font-medium text-stone-900">
                  {i === 0 && "🏆 "}
                  {row.flavor}
                </td>
                <td className="whitespace-nowrap py-2 pr-4 text-stone-700">{row.total_quantity}</td>
                <td className="whitespace-nowrap py-2 pr-4 text-stone-700">{row.order_count}</td>
                <td className="whitespace-nowrap py-2 text-stone-700">{formatPrice(row.total_revenue)}</td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

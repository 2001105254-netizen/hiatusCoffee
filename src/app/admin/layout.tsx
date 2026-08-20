import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div>
      <nav className="mb-6 flex gap-4 border-b border-stone-200 pb-3 text-sm font-medium">
        <Link href="/admin" className="text-stone-700 hover:text-stone-900">
          Analytics
        </Link>
        <Link href="/admin/menu" className="text-stone-700 hover:text-stone-900">
          Menu
        </Link>
        <Link href="/admin/orders" className="text-stone-700 hover:text-stone-900">
          Orders
        </Link>
      </nav>
      {children}
    </div>
  );
}

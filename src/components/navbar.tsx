import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CartBadge } from "@/components/cart-badge";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileNav } from "@/components/mobile-nav";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="relative border-b border-stone-200 bg-stone-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-serif font-semibold tracking-tight text-stone-900">
          Hiatus
        </Link>

        <nav className="hidden items-center gap-5 sm:flex">
          <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">
            Menu
          </Link>
          <CartBadge />

          {user ? (
            <>
              <Link href="/orders" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                My orders
              </Link>
              <Link href="/profile" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-sm font-medium text-amber-800 hover:text-amber-900">
                  Admin
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3 sm:hidden">
          <CartBadge />
          <MobileNav isLoggedIn={!!user} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}

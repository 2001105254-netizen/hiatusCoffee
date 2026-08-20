"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function MobileNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-stone-200"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className="text-xl leading-none">✕</span>
        ) : (
          <span className="text-xl leading-none">☰</span>
        )}
      </button>

      {open && (
        <nav
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-stone-200 bg-stone-50 px-4 py-3 shadow-sm"
          onClick={() => setOpen(false)}
        >
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
            Menu
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/orders" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
                My orders
              </Link>
              <Link href="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
                Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium text-amber-800 hover:bg-stone-200">
                  Admin
                </Link>
              )}
              <div className="px-3 py-2">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
                Log in
              </Link>
              <Link href="/signup" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200">
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </div>
  );
}

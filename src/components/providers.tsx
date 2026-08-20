"use client";

import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/lib/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
    </CartProvider>
  );
}

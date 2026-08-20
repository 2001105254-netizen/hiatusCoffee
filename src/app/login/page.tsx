import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Log in to Hiatus</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-sm text-stone-600">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-amber-800 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Create your account</h1>
      <SignupForm />
      <p className="mt-4 text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-amber-800 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

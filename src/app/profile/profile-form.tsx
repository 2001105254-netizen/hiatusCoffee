"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import type { Profile } from "@/types/database";

const initialState: ProfileState = { error: null, success: false };

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-stone-700">Email</label>
        <input
          value={email}
          disabled
          className="rounded-lg border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-stone-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-sm font-medium text-stone-700">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={profile.full_name ?? ""}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-stone-700">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={profile.phone ?? ""}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  return (
    <div className="mx-auto max-w-sm py-6">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Profile</h1>
      {profile && <ProfileForm profile={profile} email={user!.email ?? ""} />}
    </div>
  );
}

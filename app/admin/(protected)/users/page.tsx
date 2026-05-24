import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./UsersTable";
import Link from "next/link";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const params = await searchParams;
  const inviteOpen = params.invite === "1";
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser?.id)
    .single();

  if (currentProfile?.role !== "admin") {
    return (
      <div className="max-w-2xl">
        <p className="font-sans text-[10px] tracking-[2.5px] uppercase text-[#9B9590] mb-3">
          Эрх хүрэлцэхгүй
        </p>
        <h1 className="font-serif text-2xl text-[#111111] mb-4">
          Хэрэглэгчийн эрхийг зөвхөн админ удирдана
        </h1>
        <p className="font-inter text-sm leading-6 text-[#6F6863] mb-6">
          Редактор контент, медиа, календарь дээр ажиллах боломжтой. Харин
          багийн гишүүн урих, хэрэглэгчийн эрх өөрчлөх үйлдэл админы хэсэгт
          хамгаалагдсан.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors"
        >
          Самбар руу буцах
        </Link>
      </div>
    );
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .order("created_at", { ascending: false });

  // Try to get auth users via admin client, fallback to empty
  let authUsers: { id: string; email: string }[] = [];
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();
    const {
      data: { users },
    } = await adminSupabase.auth.admin.listUsers();
    authUsers = users.map((u) => ({ id: u.id, email: u.email || "" }));
  } catch {
    console.warn(
      "Service role key тохируулаагүй тул auth хэрэглэгчдийн имэйл харагдахгүй",
    );
  }

  const usersWithEmail = (profiles || []).map((p) => ({
    ...p,
    email: authUsers.find((u) => u.id === p.id)?.email || "",
  }));

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-8 w-full">
        <h1 className="font-serif text-2xl text-[#111111]">Баг</h1>
        <Link
          href="/admin/users?invite=1"
          className="bg-[#111111] text-white font-sans font-bold text-[10px] tracking-[2.5px] uppercase px-5 py-2.5 hover:bg-[#333] transition-colors"
        >
          Гишүүн урих
        </Link>
      </header>

      <UsersTable
        initialUsers={usersWithEmail}
        currentUserId={currentUser?.id || null}
        inviteOpen={inviteOpen}
      />
    </div>
  );
}

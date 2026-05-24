import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай." }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Service role key тохируулаагүй байна." },
      { status: 500 },
    );
  }

  const adminSupabase = createAdminClient();
  await adminSupabase.from("bookmarks").delete().eq("user_id", user.id);
  await adminSupabase.from("profiles").delete().eq("id", user.id);

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

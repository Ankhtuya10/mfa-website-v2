import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_ROLES = new Set(["viewer", "editor", "admin"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const role = typeof body?.role === "string" ? body.role : "";

    if (!id) {
      return NextResponse.json(
        { error: "Хэрэглэгчийн ID олдсонгүй." },
        { status: 400 },
      );
    }

    if (!VALID_ROLES.has(role)) {
      return NextResponse.json(
        { error: "Зөв эрх сонгоно уу." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Нэвтрэх шаардлагатай." },
        { status: 401 },
      );
    }

    if (user.id === id) {
      return NextResponse.json(
        { error: "Өөрийн эрхийг энэ хэсгээс өөрчлөх боломжгүй." },
        { status: 400 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Зөвхөн админ хэрэглэгчийн эрх өөрчлөх боломжтой." },
        { status: 403 },
      );
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select("id, role")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Сервер дээр алдаа гарлаа.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

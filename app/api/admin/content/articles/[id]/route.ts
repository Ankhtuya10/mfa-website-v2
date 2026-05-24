import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { createContentRepository } from "@/lib/couchdb/repository";
import { adminJsonError } from "../../utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const article = await createContentRepository().getArticleById(id);
    if (!article) return NextResponse.json({ error: "Нийтлэл олдсонгүй" }, { status: 404 });
    return NextResponse.json(article);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const isAdmin = auth.profile?.role === "admin";

    if (!isAdmin && body.status === "published") {
      return NextResponse.json(
        { error: "Нийтлэл нийтлэх эрх зөвхөн админд байна." },
        { status: 403 },
      );
    }

    const articleInput = { ...body };
    if (!isAdmin) {
      delete articleInput.published_at;
      delete articleInput.review_note;
      delete articleInput.reviewed_at;
      delete articleInput.reviewed_by;
    }

    const article = await createContentRepository().upsertArticle({
      ...articleInput,
      id,
      author_id: articleInput.author_id ?? auth.user?.id ?? null,
      author_name:
        articleInput.author_name ||
        auth.user?.email?.split("@")[0] ||
        (isAdmin ? "Админ" : "Редактор"),
      reviewed_by: isAdmin ? articleInput.reviewed_by ?? auth.user?.id ?? null : null,
    });
    return NextResponse.json(article);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const deleted = await createContentRepository().deleteArticle(id);
    if (!deleted) return NextResponse.json({ error: "Нийтлэл олдсонгүй" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminJsonError(error);
  }
}

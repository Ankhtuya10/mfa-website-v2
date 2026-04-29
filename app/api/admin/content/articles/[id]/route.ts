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
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
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
    const article = await createContentRepository().upsertArticle({
      ...body,
      id,
      author_id: body.author_id || auth.user?.id || null,
      author_name: body.author_name || auth.user?.email?.split("@")[0] || "Admin",
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
    if (!deleted) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminJsonError(error);
  }
}

import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { createContentRepository } from "@/lib/couchdb/repository";
import { adminJsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const articles = await createContentRepository().getArticles({ status: "all" });
    return NextResponse.json(articles);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
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
      author_id: articleInput.author_id || auth.user?.id || null,
      author_name:
        articleInput.author_name ||
        auth.user?.email?.split("@")[0] ||
        (isAdmin ? "Админ" : "Редактор"),
    });
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return adminJsonError(error);
  }
}

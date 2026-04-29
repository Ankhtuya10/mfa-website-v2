import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../../utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const designer = await createContentRepository().getDesignerBySlug(decodeURIComponent(slug));
    if (!designer) return NextResponse.json({ error: "Designer not found" }, { status: 404 });
    return NextResponse.json(designer);
  } catch (error) {
    return jsonError(error);
  }
}

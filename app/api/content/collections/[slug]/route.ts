import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../../utils";

export const revalidate = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const collection = await createContentRepository().getCollectionBySlug(decodeURIComponent(slug));
    if (!collection) return NextResponse.json({ error: "Цуглуулга олдсонгүй" }, { status: 404 });
    return NextResponse.json(collection);
  } catch (error) {
    return jsonError(error);
  }
}

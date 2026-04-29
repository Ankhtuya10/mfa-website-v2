import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articles = await createContentRepository().getArticles({
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
    });
    return NextResponse.json(articles);
  } catch (error) {
    return jsonError(error);
  }
}

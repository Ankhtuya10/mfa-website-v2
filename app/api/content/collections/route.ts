import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collections = await createContentRepository().getCollections({
      season: searchParams.get("season") || undefined,
      designerSlug: searchParams.get("designerSlug") || undefined,
    });
    return NextResponse.json(collections);
  } catch (error) {
    return jsonError(error);
  }
}

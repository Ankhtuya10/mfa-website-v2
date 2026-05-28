import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { createContentRepository } from "@/lib/couchdb/repository";
import { adminJsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await createContentRepository().getFeaturedDiscover();
    return NextResponse.json(data ?? null);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id, type, heroVideoId, discoverVideoId, discoverImageId } = await request.json();
    if (!id || !["collection", "article"].includes(type)) {
      return NextResponse.json({ error: "id болон type шаардлагатай" }, { status: 400 });
    }
    await createContentRepository().setFeaturedDiscover(id, type, {
      heroVideoId: heroVideoId ?? null,
      discoverVideoId: discoverVideoId ?? null,
      discoverImageId: discoverImageId ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminJsonError(error);
  }
}

import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";

export const revalidate = 60;

export async function GET() {
  try {
    const featured = await createContentRepository().getFeaturedMedia();
    return NextResponse.json({
      hero_image: featured.hero_image?.url ?? null,
      hero_video: featured.hero_video?.url ?? null,
      discover_video: featured.discover_video?.url ?? null,
      discover_image: featured.discover_image?.url ?? null,
    });
  } catch {
    return NextResponse.json(
      { hero_image: null, hero_video: null, discover_video: null, discover_image: null },
      { status: 500 },
    );
  }
}

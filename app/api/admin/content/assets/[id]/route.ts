import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { createContentRepository } from "@/lib/couchdb/repository";
import type { FeaturedSlot } from "@/lib/couchdb/content";
import { adminJsonError } from "../../utils";

export const dynamic = "force-dynamic";

const VALID_SLOTS: FeaturedSlot[] = ["hero_image", "hero_video", "discover_video"];

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const deleted = await createContentRepository().deleteAsset(decodeURIComponent(id));
    if (!deleted) return NextResponse.json({ error: "Asset олдсонгүй" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const slot: FeaturedSlot | null = body.featured ?? null;

    if (slot !== null && !VALID_SLOTS.includes(slot)) {
      return NextResponse.json({ error: "Буруу slot" }, { status: 400 });
    }

    const asset = await createContentRepository().updateAssetFeatured(
      decodeURIComponent(id),
      slot,
    );
    return NextResponse.json(asset);
  } catch (error) {
    return adminJsonError(error);
  }
}

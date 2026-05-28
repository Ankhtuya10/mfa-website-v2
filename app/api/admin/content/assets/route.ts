import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { ASSET_FOLDERS } from "@/lib/content/assetFolders";
import { createContentRepository } from "@/lib/couchdb/repository";
import { adminJsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const assets = await createContentRepository().listAssets(searchParams.get("folder") || undefined);
    return NextResponse.json(assets);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл илгээгээгүй байна" }, { status: 400 });
    }
    const folder = String(formData.get("folder") || ASSET_FOLDERS.general);
    const asset = await createContentRepository().createAsset(file, folder);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return adminJsonError(error);
  }
}

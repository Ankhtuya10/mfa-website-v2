import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const designers = await createContentRepository().getDesigners(searchParams.get("tier") || undefined);
    return NextResponse.json(designers);
  } catch (error) {
    return jsonError(error);
  }
}

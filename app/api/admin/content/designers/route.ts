import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { createContentRepository } from "@/lib/couchdb/repository";
import { adminJsonError } from "../utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const designers = await createContentRepository().getDesigners();
    return NextResponse.json(designers);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const designer = await createContentRepository().upsertDesigner(body);
    return NextResponse.json(designer, { status: 201 });
  } catch (error) {
    return adminJsonError(error);
  }
}

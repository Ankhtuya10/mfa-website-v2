import { NextResponse } from "next/server";
import { requireContentAdmin } from "@/lib/admin/contentAuth";
import { createContentRepository } from "@/lib/couchdb/repository";
import { adminJsonError } from "../../utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const designer = await createContentRepository().getDesignerById(id);
    if (!designer) return NextResponse.json({ error: "Designer not found" }, { status: 404 });
    return NextResponse.json(designer);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const designer = await createContentRepository().upsertDesigner({ ...body, id });
    return NextResponse.json(designer);
  } catch (error) {
    return adminJsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireContentAdmin();
  if (auth.response) return auth.response;

  try {
    const { id } = await context.params;
    const deleted = await createContentRepository().deleteDesigner(id);
    if (!deleted) return NextResponse.json({ error: "Designer not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminJsonError(error);
  }
}

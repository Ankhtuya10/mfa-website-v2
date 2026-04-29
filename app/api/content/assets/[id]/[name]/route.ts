import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../../../utils";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; name: string }> },
) {
  try {
    const { id, name } = await context.params;
    const source = await createContentRepository().getAssetAttachment(id, name);
    const headers = new Headers();
    headers.set("Content-Type", source.headers.get("Content-Type") || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(source.body, { headers });
  } catch (error) {
    return jsonError(error, "Asset not found");
  }
}

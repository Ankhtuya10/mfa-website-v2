import { createContentRepository } from "@/lib/couchdb/repository";
import { jsonError } from "../../../utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; name: string }> },
) {
  try {
    const { id, name } = await context.params;
    const range = request.headers.get("Range");
    const source = await createContentRepository().getAssetAttachment(
      id,
      name,
      range ? { headers: { Range: range } } : {},
    );
    const headers = new Headers();
    for (const key of [
      "Accept-Ranges",
      "Content-Length",
      "Content-Range",
      "Content-Type",
      "ETag",
    ]) {
      const value = source.headers.get(key);
      if (value) headers.set(key, value);
    }
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/octet-stream");
    }
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(source.body, { headers, status: source.status });
  } catch (error) {
    return jsonError(error, "Медиа файл олдсонгүй");
  }
}

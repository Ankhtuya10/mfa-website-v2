import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";
import { formatSeasonYear } from "@/lib/localization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await createContentRepository().getFeaturedDiscover();
    if (!data) return NextResponse.json(null);

    const seasonLabel =
      data.type === "collection" && data.season && data.year
        ? formatSeasonYear(data.season, data.year)
        : null;

    const link =
      data.type === "collection"
        ? `/archive/${data.slug}`
        : `/editorial/${data.slug}`;

    return NextResponse.json({
      type: data.type,
      id: data.id,
      title: data.title,
      description: data.description,
      season_label: seasonLabel,
      link,
      link_label: data.type === "collection" ? "Цуглуулга үзэх" : "Нийтлэл унших",
    });
  } catch {
    return NextResponse.json(null);
  }
}

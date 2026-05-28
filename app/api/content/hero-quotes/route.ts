import { NextResponse } from "next/server";
import { createContentRepository } from "@/lib/couchdb/repository";

export const revalidate = 60;

const FALLBACK_QUOTES = [
  {
    text: '"Загвар бол амьдралыг даван туулах хуяг юм."',
    author: "— Nomin D.",
  },
  {
    text: '"Тал нутаг бидэнд гоо сайхан даруу намбанд оршдогийг заасан."',
    author: "— Goyol Studio",
  },
  {
    text: '"Ширхэг бүрт сүргийн дурсамж хадгалагддаг."',
    author: "— Gobi Cashmere",
  },
];

export async function GET() {
  try {
    const quotes = await createContentRepository().getHeroQuotes();
    return NextResponse.json({ quotes: quotes.length ? quotes : FALLBACK_QUOTES });
  } catch {
    return NextResponse.json({ quotes: FALLBACK_QUOTES });
  }
}

export async function PUT(req: Request) {
  try {
    const { quotes } = await req.json();
    if (!Array.isArray(quotes)) {
      return NextResponse.json({ error: "quotes must be an array" }, { status: 400 });
    }
    await createContentRepository().setHeroQuotes(quotes);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save quotes" }, { status: 500 });
  }
}

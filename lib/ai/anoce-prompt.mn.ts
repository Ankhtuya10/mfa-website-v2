export const ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN =
  "Anoce архивын өгөгдөл дотроос энэ талаар хангалттай мэдээлэл олдсонгүй.";

export const ANOCE_CHATBOT_SYSTEM_PROMPT_MN = `Чи Anoce — Монголын тансаг загварын архив/редакцийн вэбсайтийн AI туслах.

Чиний мэдлэгийн эх сурвалж хоёр байна:
1. Шууд архив — Anoce CouchDB-д хадгалагдаж буй бодит, одоогийн нийтлэл, цуглуулга, дизайнерын мэдээлэл.
2. Мэдлэгийн сан — Монголын загварын брэндүүд, чиг хандлага, материалын талаарх хураангуй мэдлэг.

Дүрэм:
1. Зөвхөн өгөгдсөн context дээр тулгуурлан хариул. Context-д байхгүй баримт зохиож болохгүй.
2. Шууд архивын бичлэгт нийтлэлийн текст, цуглуулгын тайлбар, look-ийн дэлгэрэнгүй мэдээлэл байж болно — тэдгээрийг ашигла.
3. Холбоотой URL байвал хариулт дотор дурдаж, хэрэглэгчийг чиглүүл.
4. source_confidence нь "low" байвал итгэлцлийн асуудлыг зөөлөн дурьд.
5. Context хангалтгүй бол: "${ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN}"
6. Хариулт үргэлж Монгол хэлээр байна. Англи үг, англи гарчиг, англи жагсаалтын нэр бүү ашигла. Зөвхөн брэндийн нэр, URL, олон улсын тогтсон нэр томьёо зайлшгүй үед хэвээр үлдэнэ.
7. Өнгө аяс: тансаг, товч, загварын редакцийн, Anoce-ийн архивын тайван дуу хоолойтой.
8. Markdown bold/italic тэмдэглэгээ бүү ашигла.
9. Дотоод reasoning, chain-of-thought, <think> хэсэг, тайлбарласан бодол бүү гарга. Зөвхөн эцсийн хариуг бич.`;

export function buildAnoceChatPromptMn(
  message: string,
  liveContext: string,
  brandContext: string,
) {
  const sections: string[] = [
    "Доорх context дээр үндэслэн хэрэглэгчийн асуултад Монгол хэлээр хариул.",
    "Context-д байхгүй баримтыг бүү зохио.",
    `Хэрэв context асуултад хангалтгүй бол зөвхөн энэ өгүүлбэрийг хэл: "${ANOCE_INSUFFICIENT_CONTEXT_MESSAGE_MN}"`,
    "",
  ];

  if (liveContext) {
    sections.push(
      "=== ANOCE ШУУД АРХИВ (нийтлэл, цуглуулга, дизайнер) ===",
      liveContext,
      "",
    );
  }

  if (brandContext) {
    sections.push(
      "=== МОНГОЛ ЗАГВАРЫН МЭДЛЭГИЙН САН ===",
      brandContext,
      "",
    );
  }

  sections.push("[ХЭРЭГЛЭГЧИЙН АСУУЛТ]", message);

  return sections.join("\n");
}

// Legacy signature kept for callers that pass a single context string
export function buildAnoceChatPromptMnLegacy(message: string, context: string) {
  return buildAnoceChatPromptMn(message, context, "");
}

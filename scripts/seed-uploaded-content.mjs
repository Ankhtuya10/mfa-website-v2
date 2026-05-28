import { readFileSync } from "fs";
import { basename } from "path";

const COUCHDB_URL = "http://127.0.0.1:5984";
const DB = "anoce_content";
const AUTH = Buffer.from("anoce:1234").toString("base64");
const BASE = `${COUCHDB_URL}/${DB}`;
const HEADERS = { Authorization: `Basic ${AUTH}`, "Content-Type": "application/json" };

const IMG_DIR = "/Users/anocea/Downloads/images for upload";

async function putDoc(doc) {
  const res = await fetch(`${BASE}/${encodeURIComponent(doc._id)}`, {
    method: "PUT",
    headers: HEADERS,
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    const body = await res.text();
    // Conflict = doc already exists, fetch current rev and retry
    if (res.status === 409) {
      const existing = await fetch(`${BASE}/${encodeURIComponent(doc._id)}`, {
        headers: { Authorization: `Basic ${AUTH}` },
      }).then((r) => r.json());
      return putDoc({ ...doc, _rev: existing._rev });
    }
    throw new Error(`PUT ${doc._id}: ${res.status} ${body}`);
  }
  return res.json();
}

async function putAttachment(docId, rev, name, data, contentType) {
  const url = `${BASE}/${encodeURIComponent(docId)}/${encodeURIComponent(name)}?rev=${rev}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Basic ${AUTH}`, "Content-Type": contentType },
    body: data,
  });
  if (!res.ok) throw new Error(`ATT ${name}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function uploadImage(filename) {
  const filePath = `${IMG_DIR}/${filename}`;
  const fileData = readFileSync(filePath);
  const now = new Date().toISOString();
  const stamp = Date.now();
  const stampedName = `${stamp}-${filename}`;
  const docId = `asset:asset-photos-${stampedName}`;

  const doc = {
    _id: docId,
    type: "asset",
    name: stampedName,
    path: `photos/${stampedName}`,
    folder: "photos",
    content_type: "image/jpeg",
    size: fileData.length,
    created_at: now,
    updated_at: now,
  };

  console.log(`  upload: ${filename}`);
  const created = await putDoc(doc);
  await putAttachment(docId, created.rev, stampedName, fileData, "image/jpeg");

  const url = `/api/content/assets/${encodeURIComponent(docId)}/${encodeURIComponent(stampedName)}`;
  return url;
}

// ─── Upload all images ────────────────────────────────────────────────────────

console.log("\n=== Зураг байршуулж байна (25 зураг) ===\n");

const files = {
  bag:             "pexels-a-darmel-8989582.jpg",
  urban2:          "pexels-cottonbro-10131833.jpg",
  grassland:       "pexels-cottonbro-10667871.jpg",
  deel_detail:     "pexels-cottonbro-9466046.jpg",
  deel_mountain:   "pexels-cottonbro-9466548.jpg",
  deel_tea:        "pexels-cottonbro-9466911.jpg",
  deel_back:       "pexels-cottonbro-9467204.jpg",
  deel_snow:       "pexels-cottonbro-9467574.jpg",
  deel_curtain:    "pexels-cottonbro-9476856.jpg",
  deel_children:   "pexels-cottonbro-9476857.jpg",
  deel_red_solo:   "pexels-cottonbro-9480021.jpg",
  deel_red_runway: "pexels-cottonbro-9480464.jpg",
  portrait_glasses:"pexels-doquyen-1520760.jpg",
  avantgarde:      "pexels-felix-young-449360607-34440700.jpg",
  boots_black:     "pexels-jose-martin-segura-benites-1422456152-26732212.jpg",
  boots_brown:     "pexels-jose-martin-segura-benites-1422456152-27256470.jpg",
  shoes_street:    "pexels-kahlibrown-26888071.jpg",
  beauty_knit:     "pexels-kooldark-19601316.jpg",
  heels_pearls:    "pexels-nudethephotographer-37190237.jpg",
  pearl_necklace:  "pexels-tinypearl-xoxo-2160572462-36854157.jpg",
  pearl_bracelet:  "pexels-tinypearl-xoxo-2160572462-36854163.jpg",
  folk_grassland:  "pexels-vo-van-ti-n-2037497312-29535053.jpg",
  deel_brown:      "pexels-yasar-baskurt-706180077-37741536.jpg",
  portrait_black:  "pexels-yi-ren-57040649-33204142.jpg",
  deel_white:      "pexels-zulurid-2176926-3952803.jpg",
};

const urls = {};
for (const [key, filename] of Object.entries(files)) {
  urls[key] = await uploadImage(filename);
}

console.log("\n✓ Бүх зураг байршлаа\n");

// ─── Designers ────────────────────────────────────────────────────────────────

console.log("=== Дизайнер үүсгэж байна ===\n");

const now = new Date().toISOString();

await putDoc({
  _id: "designer:battsetseg-nyamdavaa",
  type: "designer",
  slug: "battsetseg-nyamdavaa",
  name: "Батцэцэг Нямдаваа",
  brand: "Говийн Ногоон",
  tier: "high-end",
  nationality: "Монгол",
  founded: 2018,
  active_seasons: 12,
  profile_image: urls.portrait_glasses,
  cover_image: urls.deel_red_runway,
  short_bio: "Монгол дээлний уламжлалт хэлбэрийг орчин үеийн тансаг загвараар дахин тайлбарладаг.",
  bio: "Батцэцэг Нямдаваа 2018 онд 'Говийн Ногоон' брэндийг үүсгэн байгуулж, Монгол дээлний уламжлалт хэлбэр, зах, ханцуй, алтан гутлыг орчин үеийн силуэт болон тансаг материалтай хослуулах чиглэлд анхаарлаа хандуулжээ. Тэр Улаанбаатарын загварын долоо хоногт 6 удаа цуглуулгаа танилцуулсан бөгөөд Токио, Сеулийн эклектик загварын уралдаанд оролцож байсан. Батцэцэгийн бүтээлд нил ягаан, цэнхэр, цагаан зэрэг тод өнгийн ноолуур, торго давамгайлдаг.",
  social_links: { instagram: "@goviin_nogoon", website: "https://goviinogoon.mn" },
  created_at: now,
  updated_at: now,
});
console.log("  ✓ Батцэцэг Нямдаваа (Говийн Ногоон)");

await putDoc({
  _id: "designer:narantuya-galbadrah",
  type: "designer",
  slug: "narantuya-galbadrah",
  name: "Нарантуяа Галбадрах",
  brand: "Нүүдэл Studio",
  tier: "contemporary",
  nationality: "Монгол",
  founded: 2021,
  active_seasons: 7,
  profile_image: urls.beauty_knit,
  cover_image: urls.urban2,
  short_bio: "Нүүдэлчдийн гоо зүйг хотын хэмнэлтэй нийлүүлдэг орчин үеийн загварч.",
  bio: "Нарантуяа Галбадрах 'Нүүдэл Studio'-г 2021 онд Улаанбаатарт нээж, нүүдэлчдийн амьдралын хэв маяг, тал нутгийн өнгө аяс, чулуутай газрын дүрслэлийг хотын хувцаслалтын хэлд орчуулдаг. Ноолуур, тэмээний ноос, лавсан гэх мэт уламжлалт материалыг орчин үеийн эсгүүртэй нийлүүлж, 'өдөр тутмын уран бүтээл' гэсэн философитой ажилладаг. Тэр дизайны боловсролоо Сеулд эзэмшсэн.",
  social_links: { instagram: "@nuudel.studio" },
  created_at: now,
  updated_at: now,
});
console.log("  ✓ Нарантуяа Галбадрах (Нүүдэл Studio)\n");

// ─── Collections ──────────────────────────────────────────────────────────────

console.log("=== Цуглуулга үүсгэж байна ===\n");

await putDoc({
  _id: "collection:battsetseg-fw2024-ovliin-hishig",
  type: "collection",
  slug: "battsetseg-fw2024-ovliin-hishig",
  title: "Өвлийн хишиг",
  designer_id: "designer:battsetseg-nyamdavaa",
  designer_name: "Батцэцэг Нямдаваа",
  designer_slug: "battsetseg-nyamdavaa",
  season: "FW",
  year: 2024,
  description:
    "Өвлийн хишиг цуглуулга нь Монгол нутгийн хүйтэн цагийн гоо зүйн тухай яруу найраг шиг өгүүлдэг. Мөсөн уулын цагаан өнгийг зальхай улаан дээлтэй нийлүүлж, хурган малгай, мөнгөн зүүлт чимэглэлийг орчин үеийн загварт шингээжээ. 8 дүрсний энэ цуглуулга FW 2024 улиралд Улаанбаатарт дэлгэгдсэн.",
  cover_image: urls.deel_red_runway,
  categories: ["дээл", "уламжлалт", "нэхий", "торго"],
  materials: ["торго", "ноолуур", "тэмээний ноос", "нэхий"],
  colors: ["цэнхэр", "улаан", "цагаан", "алт"],
  occasions: ["баяр ёслол", "үдэшлэг", "улирлын шоу"],
  looks: [
    {
      id: "look-1",
      number: 1,
      image: urls.deel_detail,
      description: "Цэнхэр торгон дээл дээрх алтан хээ, мөнгөн зүүлт. Уламжлалт гоёл чимэглэлийн дэлгэрэнгүй харагдац.",
      materials: ["торго", "мөнгө", "алт"],
      tags: ["дээл", "зүүлт", "уламжлалт"],
    },
    {
      id: "look-2",
      number: 2,
      image: urls.deel_mountain,
      description: "Хурган малгайтай цэнхэр дээл. Цасан уулын тойргоор зогсож буй загварчны дүр. Цэнхэр ба цагаан өнгийн харьцаа.",
      materials: ["торго", "хурган арьс"],
      tags: ["дээл", "малгай", "өвлийн"],
    },
    {
      id: "look-3",
      number: 3,
      image: urls.deel_tea,
      description: "Хоёр загварч цай барьсан хүрэлцэн зогсож буй дүрс. Монгол ёс заншлыг хувцасны дизайнтай нийлүүлсэн нь энэ дүрд хамгийн тод илэрхийлэгдэнэ.",
      materials: ["торго", "мөнгөн хэмжүүр"],
      tags: ["дээл", "ёслол", "уламжлал"],
    },
    {
      id: "look-4",
      number: 4,
      image: urls.deel_back,
      description: "Ар талын харагдац. Хурган ноосон малгайн давхрага болон нурууны торгон хэвлэмэл. Сарниулсан сүлжмэлийн дэлгэрэнгүй.",
      materials: ["торго", "хурган ноос"],
      tags: ["дээл", "малгай", "арын харагдац"],
    },
    {
      id: "look-5",
      number: 5,
      image: urls.deel_snow,
      description: "Цасан шөнийн дүр. Ээж, хүүхэд хоёр нэг загварын дээл өмсөж, хоёулаа уламжлалт малгай, алтан чимэглэлтэй.",
      materials: ["торго", "хурган арьс", "ноолуур"],
      tags: ["дээл", "өвлийн", "гэр бүл"],
    },
    {
      id: "look-6",
      number: 6,
      image: urls.deel_curtain,
      description: "Цагаан хөшигний цаанаас харагдах цэнхэр дээл. Мөнгөн зүүлт, чимэглэлтэй. Загварын шоуны тайзны гэрэлтэй дүрс.",
      materials: ["торго", "мөнгө"],
      tags: ["дээл", "шоу", "тайз"],
    },
    {
      id: "look-7",
      number: 7,
      image: urls.deel_children,
      description: "Монгол бичгийн хөшигний ард хоёр хүүхэд. Хурган малгайтай цэнхэр дээл. Дараагийн үеийн загварыг илэрхийлнэ.",
      materials: ["торго", "хурган ноос"],
      tags: ["хүүхэд", "дээл", "уламжлал"],
    },
    {
      id: "look-8",
      number: 8,
      image: urls.deel_red_solo,
      description: "Улаан торгон дээл, ногоон зах, мөнгөн зүү. Цагаан даавуун хөшигийг барьж буй дүр — цуглуулгын кульминац.",
      materials: ["торго", "мөнгө", "ногоон зах"],
      tags: ["улаан дээл", "уламжлалт", "шоу"],
    },
  ],
  created_at: now,
  updated_at: now,
});
console.log("  ✓ 'Өвлийн хишиг' FW 2024 — Батцэцэг Нямдаваа (8 дүрс)");

await putDoc({
  _id: "collection:narantuya-ss2025-nuudelchnii-duu",
  type: "collection",
  slug: "narantuya-ss2025-nuudelchnii-duu",
  title: "Нүүдэлчний дуу",
  designer_id: "designer:narantuya-galbadrah",
  designer_name: "Нарантуяа Галбадрах",
  designer_slug: "narantuya-galbadrah",
  season: "SS",
  year: 2025,
  description:
    "Нүүдэлчний дуу цуглуулга нь тал нутгийн чөлөөт амьсгалыг хотын хувцасны хэлд оруулах оролдлого юм. Цагаан, бор, хөх ногоон өнгийн давхарлалыг ашиглан нүүдэлчдийн амьдрах чадвар, хөнгөн байдлыг тусгасан. SS 2025 улиралд 4 дүрстэйгээр танилцуулагдсан.",
  cover_image: urls.grassland,
  categories: ["орчин үеийн", "нүүдэлчний", "хотын", "байгалийн"],
  materials: ["ноолуур", "тэмээний ноос", "маалинга", "торго"],
  colors: ["цагаан", "бор", "хөх ногоон", "хар"],
  occasions: ["өдөр тутмын", "зуны баяр", "уличный стиль"],
  looks: [
    {
      id: "look-1",
      number: 1,
      image: urls.urban2,
      description: "Хоёр загварч хотын орон сууцны дээвэр дээр. Цагаан хөнгөн хувцас, бежевий пальто. Нүүдэлчний эрх чөлөөг хотын тайзнаа илэрхийлнэ.",
      materials: ["маалинга", "ноолуур"],
      tags: ["хотын", "цагаан", "зун"],
    },
    {
      id: "look-2",
      number: 2,
      image: urls.grassland,
      description: "Тал нутгийн уудам дэргэд хоёр загварч. Боохой загварын хувцас, тэмээний ноосон гадуур хувцас. Нүүдэлчний гоо зүйн мөн чанар.",
      materials: ["тэмээний ноос", "маалинга"],
      tags: ["тал нутаг", "нүүдэлчний", "байгалийн"],
    },
    {
      id: "look-3",
      number: 3,
      image: urls.deel_white,
      description: "Наранд жинхэнэ монгол торгон дээлт сарнаагүй цагаан. Залуу загварч гүйцэтгэлийн чимэг, нарны тусгал. Уламжлал ба орчин үеийн дунд.",
      materials: ["торго", "алтан зах"],
      tags: ["цагаан дээл", "нар", "залуу"],
    },
    {
      id: "look-4",
      number: 4,
      image: urls.deel_brown,
      description: "Хүрэн монгол дэгэл, үслэг малгай. Уламжлалт зүүлт, мөнгөн медал. Нүүдэлчний дайчин сүр хийморийг өнөө үед дахин амилуулав.",
      materials: ["тэмээний ноос", "үслэг малгай", "мөнгө"],
      tags: ["дэгэл", "уламжлалт", "эрэгтэй"],
    },
  ],
  created_at: now,
  updated_at: now,
});
console.log("  ✓ 'Нүүдэлчний дуу' SS 2025 — Нарантуяа Галбадрах (4 дүрс)\n");

// ─── Articles ─────────────────────────────────────────────────────────────────

console.log("=== Нийтлэл үүсгэж байна ===\n");

await putDoc({
  _id: "article:ulamjlal-ba-orchin-ue-goo-saikhan",
  type: "article",
  slug: "ulamjlal-ba-orchin-ue-goo-saikhan",
  title: "Уламжлал ба орчин үе: хоёрын хоорондох гоо сайхан",
  subtitle: "Монгол дээл яагаад зүгээр нэг хувцас биш вэ",
  category: "features",
  author_name: "Anoce редакц",
  author_id: null,
  cover_image: urls.deel_red_solo,
  cover_image_vertical: urls.deel_mountain,
  status: "published",
  designer_slug: "battsetseg-nyamdavaa",
  tags: ["дээл", "уламжлал", "орчин үе", "Монгол загвар"],
  read_time: 7,
  published_at: "2025-09-15T08:00:00.000Z",
  credits: {
    photographer: "Cottonbro Studio",
    stylist: "Батцэцэг Нямдаваа",
    location: "Улаанбаатар, Монгол",
    date: "2024 оны намар",
  },
  body:
    "Монгол дээл бол зүгээр нэг уламжлалт хувцас биш — энэ нь нүүдэлчдийн философи, цаг уурын мэргэжил, гоо зүйн ертөнцийн нэгдсэн илэрхийлэл юм. Дээлний өргөн ханцуй нь морь унахад тохиромжтой, урт хормой нь хүйтнийг дарна, бүс нь дотоод дулааныг хадгалдаг — энэ бүгд зохион байгуулалтын мэдлэгийн үр дүн.\n\nОрчин үеийн Монгол загварчид энэ уламжлалыг хуулбарлахаас илүүтэй дахин ярьж байна. Батцэцэг Нямдаваагийн 'Говийн Ногоон' брэнд нь улаан торгыг цагаан малгайтай нийлүүлж, мөнгөн чимэглэлийг шинэ нарийн зүүлтэй хослуулдаг. Ингэснээр тэр хувцасны дотор нуугдсан утгыг устгахгүйгээр шинэ хэлэнд орчуулдаг.\n\nЭнэ дахин тайлбарлах үйл явц нь зөвхөн загварын асуудал биш. Монголын залуу дизайнерууд хувцасаараа нутаг усаа, өөрсдийн ийм ийм хэн болохоо ярьдаг болжээ. Арьс өнгө, нүд хамар, мөнгөн зүүлт — энэ бүгд дэлхийн тавцанд Монгол хэн болохыг тодорхойлох шинэ хэл болж байна.",
  related_looks: [
    {
      lookId: "look-1",
      lookNumber: 1,
      image: urls.deel_detail,
      collectionSlug: "battsetseg-fw2024-ovliin-hishig",
      collectionName: "Өвлийн хишиг FW 2024",
    },
    {
      lookId: "look-8",
      lookNumber: 8,
      image: urls.deel_red_solo,
      collectionSlug: "battsetseg-fw2024-ovliin-hishig",
      collectionName: "Өвлийн хишиг FW 2024",
    },
  ],
  created_at: now,
  updated_at: now,
});
console.log("  ✓ 'Уламжлал ба орчин үе...' [features]");

await putDoc({
  _id: "article:narantuya-galbadrah-yariltslaga",
  type: "article",
  slug: "narantuya-galbadrah-yariltslaga",
  title: "Нарантуяа Галбадрах: нүүдэлчний сэтгэлгээ загварт хэрхэн амьдардаг вэ",
  subtitle: "Нүүдэл Studio-ийн үүсгэн байгуулагчтай ярилцлага",
  category: "interviews",
  author_name: "Anoce редакц",
  author_id: null,
  cover_image: urls.portrait_black,
  cover_image_vertical: urls.beauty_knit,
  status: "published",
  designer_slug: "narantuya-galbadrah",
  tags: ["ярилцлага", "нүүдэл", "орчин үеийн", "дизайнер"],
  read_time: 9,
  published_at: "2025-11-03T08:00:00.000Z",
  credits: {
    photographer: "Yi Ren / Kooldark",
    location: "Улаанбаатар",
    date: "2025 оны намар",
  },
  body:
    "Нарантуяа Галбадрах хотын ертөнцөд нүүдэлчний сэтгэлгээг байрлуулах нь зэрлэг цэцгийг аквариумд тавихтай адил биш гэдгийг онцолдог. 'Нүүдэлчин хаана ч тогтдоггүй, харин хаана байгаагаа бүрэн мэдэрдэг. Энэ нь загварын дизайнд ч тусдаг — хөдөлгөөнтэй, орон зайд мэдрэмтгий, дасан зохицдог' гэж тэр хэлнэ.\n\nТэрээр 'Нүүдэл Studio'-г Сеулд боловсрол эзэмшиж ирсний дараа нэн даруй байгуулжээ. Эхний цуглуулгадаа тэмээний ноосон хөнжил, хувцасны дотроос хийжээ — эдгээр нь нааш цааш нэлдэг, хоёр зүг тийш тэгш харагддаг, давхарласан ч хялбар байдаг. Хэрэглэгчид 'ямар нэгэн тодорхойлогдохооргүй зүйл мэдэрдэг' гэж хэлдэг байсан гэнэ.\n\nОдоо тэр SS 2025 цуглуулгаараа тал нутгийн агаарыг шууд хотын дундуур авчирч байна. Ойлгосон байдлаар биш — мэдрэгдэх байдлаар.",
  created_at: now,
  updated_at: now,
});
console.log("  ✓ 'Нарантуяа Галбадрах: ярилцлага' [interviews]");

await putDoc({
  _id: "article:zun-2025-goyol-chimegleliin-trend",
  type: "article",
  slug: "zun-2025-goyol-chimegleliin-trend",
  title: "2025 оны зун: гоёл чимэглэлийн шинэ трэнд",
  subtitle: "Сувд, гутал, цүнх — энэ улирлын гол дохиолол",
  category: "trends",
  author_name: "Anoce редакц",
  author_id: null,
  cover_image: urls.pearl_necklace,
  cover_image_vertical: urls.heels_pearls,
  status: "published",
  designer_slug: null,
  tags: ["трэнд", "сувд", "гутал", "цүнх", "зун 2025"],
  read_time: 5,
  published_at: "2025-06-01T08:00:00.000Z",
  credits: {
    photographer: "Tinypearl Studio / Nudethephotographer / Jose Martin / Kahlibrown",
    location: "Studio",
    date: "2025 оны хавар",
  },
  body:
    "2025 оны зуны трэнд нэг зүйлийг тодорхой харуулж байна: гоёл чимэглэл бол дагалдах зүйл биш, харин гол дохиолол болжээ. Барок сувдны зүүлт, бугуйвч, хүзүүвч нь 'цэвэр' гоёлын шинэ стандарт болж байна. Тэдгээр нь тэгш биш, хэлбэр нь тогтворгүй, харин яг тэрхүү зохисгүй байдал нь өвөрмөц болгодог.\n\nГуталны хувьд энэ зун хоёр чиг хандлага нэгэн зэрэг давамгайлж байна: нэг талаас хатуу арьсан, шаардлагатай чингэлэгтэй сонгодог товч гутал, нөгөө талаас шаргал хальсан цагаан квадрат хошуутай дунд өсгийтэй гутал. Хоёулаа 'чимчигнэсэн' байдлыг тусгадаг.\n\nЦүнхний хувьд бежевий жижиг биеийн цүнх тодорхой дохиолол хэвээр байна. Хэлхэлцсэн бугуйвчтэй хослуулбал ганц харцаар хангалттай хэлдэг.",
  related_looks: [
    {
      lookId: "accessories-1",
      lookNumber: 1,
      image: urls.pearl_necklace,
      collectionSlug: "narantuya-ss2025-nuudelchnii-duu",
      collectionName: "Нүүдэлчний дуу SS 2025",
    },
  ],
  created_at: now,
  updated_at: now,
});
console.log("  ✓ '2025 оны зун: гоёл чимэглэлийн трэнд' [trends]");

await putDoc({
  _id: "article:avant-garde-mongol-urt-uild",
  type: "article",
  slug: "avant-garde-mongol-urt-uild",
  title: "Авант-гарде ба Монгол: тэдний уулзалт",
  subtitle: "Байгалийн материал, ирээдүйн хэлбэр — хоёр дунд юу байдаг вэ",
  category: "features",
  author_name: "Anoce редакц",
  author_id: null,
  cover_image: urls.avantgarde,
  cover_image_vertical: urls.avantgarde,
  status: "published",
  designer_slug: null,
  tags: ["авант-гарде", "байгаль", "ирээдүй", "загвар урлал"],
  read_time: 6,
  published_at: "2025-10-20T08:00:00.000Z",
  credits: {
    photographer: "Felix Young",
    stylist: "Felix Young Studio",
    date: "2025",
  },
  body:
    "Ногоон, хүрэн, мөнгөн — байгалийн өнгийг гаднаасаа биш, хүний биеийн хэлбэрт суулгах. Авант-гарде загварын мэдрэмж нь монгол зан заншлын 'байгальтай нэг байх' философитой нийтлэг зүйл олдож байна.\n\nФеликс Янгийн энэ зураглалд загварч хуяг дуулга мэт мөрний бүтэцтэй, ногоон жигд эд болон мөнгөн металл чимэглэлийг нийлүүлсэн дүрслэл авант-гардын хамгийн шинэ чиг хандлагыг илтгэнэ. Монгол хэмнэлтэй нийцэх нь: хуяг дуулга нь дайчин сэтгэлийг, ногоон нь байгалийн ухамсрыг, мөнгөн хавтгай нь нарны тусгалыг дамжуулна.\n\nДэлхийн загварын тавцанд авант-гарде биш 'байгалийн авант-гарде' гэсэн ойлголт урган гарч байна. Монгол дизайнерууд энэ ойлголтын хамгийн органик байршилд байгаа нь тодорхой.",
  created_at: now,
  updated_at: now,
});
console.log("  ✓ 'Авант-гарде ба Монгол' [features]");

await putDoc({
  _id: "article:folk-nuudel-burtgeliin-durslel",
  type: "article",
  slug: "folk-nuudel-burtgeliin-durslel",
  title: "Тал нутгийн гоёлын дүрслэл",
  subtitle: "Нүүдэлчдийн хувцаслалт зурагт хэрхэн амьддаг вэ",
  category: "news",
  author_name: "Anoce редакц",
  author_id: null,
  cover_image: urls.folk_grassland,
  cover_image_vertical: urls.deel_brown,
  status: "published",
  designer_slug: null,
  tags: ["тал нутаг", "уламжлалт", "фото", "нүүдэлчний"],
  read_time: 4,
  published_at: "2025-08-10T08:00:00.000Z",
  credits: {
    photographer: "Vo Van Tien / Yasar Baskurt",
    location: "Гадна байршил",
    date: "2025 оны зун",
  },
  body:
    "Тал нутгийн дунд зогсоод нар жаргах шилжилтийн өнгийг харах нь — ямар ч фото засварлагаагүйгээр ч хангалттай гоо зүйтэй. Монгол нүүдэлчдийн хувцас яг ийм үзэгдэлтэй уялдаж байдаг. Тод улаан, жирийн цагаан, хүрэн арьс — эдгээр нь байгалийн дэвсгэртэй тэмцэлдэхгүй, харин нэгэн ертөнц болдог.\n\nФото урлагт нүүдэлчдийн хувцасны дүрслэл сүүлийн жилүүдэд ихэссэн. Загварын журнал, хотын зурагт, хэрэглэгчдийн агуулга — бүгдэд л тал нутгийн тэгш байдал, хувцасны хөдөлгөөн, малгайн цэгцтэй дүрс нийтлэг болов.\n\nЭнэ нь зөвхөн гоо зүйн трэнд биш — нутаг орноо үзүүлэх хүсэл эрмэлзлэл, зурагт дүрслэлээр дамжуулан ямар хэн болохоо хэлэх чадвар юм.",
  created_at: now,
  updated_at: now,
});
console.log("  ✓ 'Тал нутгийн гоёлын дүрслэл' [news]\n");

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log("=== БҮГД АМЖИЛТТАЙ ===\n");
console.log("Байршуулсан зураг:    25");
console.log("Дизайнер:             2  (Батцэцэг Нямдаваа, Нарантуяа Галбадрах)");
console.log("Цуглуулга:            2  (FW 2024 × 8 дүрс, SS 2025 × 4 дүрс)");
console.log("Нийтлэл:              5  (features×2, interviews×1, trends×1, news×1)");

// lib/anoceRagDataset.mn.ts
// Anoce AI chatbot-д зориулсан Монгол хэлтэй RAG dataset.
// Web search хэрэггүй: chatbot зөвхөн энэ dataset-ээс хайж хариулна.

export type SourceConfidence = "high" | "medium" | "low";
export type RagDocType = "brand" | "trend" | "guide";

export interface AnoceBrandMn {
  id: string;
  slug: string;
  name: string;
  tier: string;
  category: string;
  sourceConfidence: SourceConfidence;
  location: string;
  bioMn: string;
  verifiedNotesMn: string[];
  aestheticMn: string[];
  signatureMaterialsMn: string[];
  productFocusMn: string[];
  keywordsMn: string[];
  sourceUrls: string[];
}

export interface AnoceTrendMn {
  id: string;
  titleMn: string;
  year: number;
  seasonMn: string;
  summaryMn: string;
  keywordsMn: string[];
  materialsMn: string[];
  moodsMn: string[];
  relatedBrandIds: string[];
}

export interface AnoceRagDocumentMn {
  id: string;
  type: RagDocType;
  title: string;
  content: string;
  sourceConfidence: SourceConfidence;
  url: string;
  sourceUrls?: string[];
  metadata: {
    brandId?: string;
    trendId?: string;
    slug?: string;
    tier?: string;
    category?: string;
    materials?: string[];
    moods?: string[];
    keywords?: string[];
    relatedBrandIds?: string[];
  };
}

export const anoceBrandsMn: AnoceBrandMn[] = [
  {
    id: "brand-torgo",
    slug: "torgo",
    name: "TORGO",
    tier: "өв соёлын люкс",
    category: "уламжлалт-modern",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "TORGO нь торго, дээлэн силуэт, уламжлалт гар урлал, ёслолын болон орчин үеийн формал хувцасны өнгө аястай Монгол брэнд.",
    verifiedNotesMn: ["Нийтийн эх сурвалжууд TORGO-г уламжлалт Монгол силуэт, ур хийц, Европын дэгжин хэв маягийг хослуулдаг гэж дүрсэлдэг.", "Torgo Fashion нь цэвэр торго, уламжлалт болон орчин үеийн хувцасны чиглэлтэй гэж дурдагдсан."],
    aestheticMn: ["хааны мэт", "торгон", "ёслолын", "уламжлалт-modern"],
    signatureMaterialsMn: ["торго", "brocade", "хатгамал даавуу"],
    productFocusMn: ["дээл", "формал даашинз", "ёслолын хувцас"],
    keywordsMn: ["torgo", "торго", "дээл", "уламжлалт", "ёслол", "тансаг"],
    sourceUrls: ["https://www.facebook.com/torgo.official/", "https://www.ubpost.mn/a/5570"]
  },
  {
    id: "brand-urban-jeans",
    slug: "urban-jeans",
    name: "Urban Jeans",
    tier: "контемпорари",
    category: "деним-casual",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Urban Jeans нь жийнс, футболк, хүрэм, цамц, даашинз, цүнх зэрэг өдөр тутмын urban casual бүтээгдэхүүнтэй Монгол деним брэнд.",
    verifiedNotesMn: ["Urban Business Group нь 2009 онд дотооддоо жийнсэн хувцас үйлдвэрлэж борлуулах зорилготой эхэлсэн гэж танилцуулдаг.", "Urban Shop дээр жийнс, футболк, хүрэм, цүнх, сүлжмэл, даашинз, цамц зэрэг ангиллууд харагддаг."],
    aestheticMn: ["деним", "өдөр тутмын", "хотын", "залуусын casual"],
    signatureMaterialsMn: ["деним", "хөвөн", "сүлжмэл"],
    productFocusMn: ["жийнс", "футболк", "хүрэм", "цүнх"],
    keywordsMn: ["urban jeans", "жийнс", "деним", "casual", "хотын хувцас"],
    sourceUrls: ["https://www.urban.mn/", "https://urbanshop.mn/products"]
  },
  {
    id: "brand-goyol",
    slug: "goyol-cashmere",
    name: "Goyol Cashmere",
    tier: "ноолуурын люкс",
    category: "ноолуур",
    sourceConfidence: "high",
    location: "Монгол",
    bioMn: "Goyol Cashmere нь ноолуур, сарлагийн хөөвөр, торго-холимог ноолуур, тэмээний ноос ашигласан пальто, хүрэм, хантааз, дээл болон сүлжмэл бүтээгдэхүүнээр танигдах брэнд.",
    verifiedNotesMn: ["Албан ёсны сайт нь Goyol Cashmere-г 2005 оноос урласан ноолуурын брэнд гэж танилцуулдаг.", "Бүтээгдэхүүнүүд нь ноолуур, сарлагийн хөөвөр, торго-холимог ноолуур, пальто, хүрэм, ёслолын дээл зэргийг онцолдог.", "2026 оны өвлийн олимпийн Team Mongolia ноолууран хувцастай холбоотой олон улсын мэдээлэл гарсан."],
    aestheticMn: ["ноолуурын тансаг", "өвлийн ёслол", "зөөлөн tailoring", "heritage"],
    signatureMaterialsMn: ["ноолуур", "сарлагийн хөөвөр", "торго-холимог ноолуур", "тэмээний ноос"],
    productFocusMn: ["пальто", "хүрэм", "хантааз", "дээл", "сүлжмэл"],
    keywordsMn: ["goyol", "гоёл", "ноолуур", "олимп", "өвөл", "дээл", "сарлаг"],
    sourceUrls: ["https://goyolcashmere.mn/", "https://goyolcashmere.com/"]
  },
  {
    id: "brand-goyo",
    slug: "goyo-cashmere",
    name: "GOYO Cashmere",
    tier: "ноолуурын люкс",
    category: "ноолуур",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "GOYO Cashmere нь Монгол ноолуур, organic collection, сонгодог сүлжмэл хувцасны өнгө аястайгаар dataset-д бүртгэгдэнэ.",
    verifiedNotesMn: ["GOYO Cashmere нэртэй албан ёсны social сувгууд байдаг.", "Компанийн холбоо, хууль эрхзүйн факт хэлэхээс өмнө гараар баталгаажуулах шаардлагатай."],
    aestheticMn: ["ноолуур", "органик", "нүүдэлчин lifestyle", "сонгодог"],
    signatureMaterialsMn: ["ноолуур", "ноос"],
    productFocusMn: ["сүлжмэл", "улирлын ноолуур", "organic collection"],
    keywordsMn: ["goyo", "гоёо", "ноолуур", "organic", "сонгодог"],
    sourceUrls: ["https://www.instagram.com/goyocashmereofficial/", "https://www.facebook.com/GOYOCashmereOfficial/"]
  },
  {
    id: "brand-evseg",
    slug: "evseg-cashmere",
    name: "Evseg Cashmere",
    tier: "ноолуурын люкс",
    category: "ноолуур",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Evseg Cashmere нь Монгол ноолуур, ноос, тэмээний ноос, өдөр тутмын болон премиум сүлжмэл хувцасны чиглэлтэй томоохон үйлдвэрлэгчдийн нэг.",
    verifiedNotesMn: ["Evseg-ийн about page нь 2000 онд Монгол хөрөнгө оруулалттай байгуулагдаж, экологийн ноос, тэмээний ноос, ноолуурын бүтээгдэхүүн үйлдвэрлэдэг гэж дурдсан.", "Бүтээгдэхүүний хуудсууд 100% Монгол ноолуур болон өдөр тутмын классик загварыг онцолдог."],
    aestheticMn: ["классик", "зөөлөн люкс", "практик өвлийн", "премиум basic"],
    signatureMaterialsMn: ["ноолуур", "тэмээний ноос", "ноос"],
    productFocusMn: ["свитер", "кардиган", "пальто", "өдөр тутмын сүлжмэл"],
    keywordsMn: ["evseg", "эвсэг", "ноолуур", "тэмээний ноос", "ноос", "классик"],
    sourceUrls: ["https://www.evsegcashmere.com/pages/about-us", "https://evseg.mn/"]
  },
  {
    id: "brand-negun",
    slug: "negun",
    name: "Negun",
    tier: "контемпорари",
    category: "basic-ноолуур",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "Negun нь simple, comfortable basic хувцас, сүлжмэл болон ноолуурын бүтээгдэхүүний чиглэлтэй Made in Mongolia байр суурьтай брэнд.",
    verifiedNotesMn: ["Negun social хуудсууд good basics, endless options, simple and comfortable гэсэн санааг ашигладаг.", "Instagram дээр 2021 оноос Made in Mongolia clothing brand гэж танилцуулсан.", "Negun Cashmere хуудсууд дээр свитер, юбка болон ноолуурын бүтээгдэхүүнүүд харагддаг."],
    aestheticMn: ["basic", "тав тухтай", "minimal", "зөөлөн casual"],
    signatureMaterialsMn: ["ноолуур", "сүлжмэл", "хөвөн"],
    productFocusMn: ["basic хувцас", "свитер", "юбка", "casualwear"],
    keywordsMn: ["negun", "нэгүн", "basic", "тав тух", "minimal", "ноолуур"],
    sourceUrls: ["https://www.facebook.com/negun.brand/", "https://www.instagram.com/negun.brand/", "https://neguncashmere.mn/brand/neguncashmere"]
  },
  {
    id: "brand-gobi",
    slug: "gobi-cashmere",
    name: "GOBI Cashmere",
    tier: "ноолуурын люкс",
    category: "ноолуур",
    sourceConfidence: "high",
    location: "Монгол",
    bioMn: "GOBI Cashmere нь 100% Монгол ноолуур, timeless wardrobe, тав тух, чанар, олон улсын зах зээлд харагдах чадвараараа Anoce dataset-ийн гол ноолуурын брэндүүдийн нэг.",
    verifiedNotesMn: ["GOBI-ийн албан ёсны дэлгүүр 100% Монгол ноолуураар урласан люкс ноолууран хувцсыг онцолдог.", "Сайт нь timeless design, comfort, authenticity болон Mongolia-to-world cashmere байр суурийг илэрхийлдэг."],
    aestheticMn: ["timeless", "зөөлөн люкс", "minimal", "global cashmere"],
    signatureMaterialsMn: ["100% Монгол ноолуур"],
    productFocusMn: ["ноолууран свитер", "пальто", "ороолт", "wardrobe basic"],
    keywordsMn: ["gobi", "говь", "ноолуур", "100% монгол ноолуур", "timeless", "luxury"],
    sourceUrls: ["https://www.gobicashmere.com/"]
  },
  {
    id: "brand-kuvcas",
    slug: "kuvcas",
    name: "KUVCAS",
    tier: "street-contemporary",
    category: "comfort-streetwear",
    sourceConfidence: "high",
    location: "Монгол",
    bioMn: "KUVCAS нь хөдөлгөөнд саадгүй, өмсөхөд амар, unisex street-casual бүтээгдэхүүнд төвлөрсөн тав тухын Монгол брэнд.",
    verifiedNotesMn: ["KUVCAS өөрийн үндсэн зарчмыг өмсөхөд амар, хөдөлгөөнд саадгүй, ямар ч нөхцөлд тав тухтай хувцас гэж тайлбарладаг.", "Бүтээгдэхүүний хуудсанд unisex polo, sweatshirt, hoodie, bomber jacket, reflective coat, accessories зэрэг харагддаг."],
    aestheticMn: ["тав тух", "unisex", "street-casual", "хөдөлгөөн"],
    signatureMaterialsMn: ["хөвөн", "fleece", "сүлжмэл"],
    productFocusMn: ["hoodie", "sweatshirt", "polo", "bomber", "coat"],
    keywordsMn: ["kuvcas", "кувкас", "тав тух", "unisex", "hoodie", "streetwear", "хөдөлгөөн"],
    sourceUrls: ["https://kuvcas.com/about", "https://kuvcas.com/products"]
  },
  {
    id: "brand-kidult",
    slug: "kidult",
    name: "Kidult",
    tier: "street-contemporary",
    category: "streetwear",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Kidult нь Улаанбаатарын streetwear брэнд бөгөөд hoodie, sweatshirt, shirt, t-shirt, pants, cap, beanie, accessories зэрэг залуу үеийн бүтээгдэхүүнтэй.",
    verifiedNotesMn: ["Kidult shop category-д Hoodie & Sweatshirt, Shirt, T-shirt & Vest, Pants, Accessories багтдаг.", "Instagram нь Kidult-ийг Улаанбаатар, Монголд байгуулагдсан clothing brand гэж танилцуулдаг."],
    aestheticMn: ["streetwear", "тоглоомтой", "graphic", "залуус"],
    signatureMaterialsMn: ["хөвөн", "fleece", "сүлжмэл"],
    productFocusMn: ["hoodie", "t-shirt", "cap", "beanie", "pants"],
    keywordsMn: ["kidult", "кидалт", "streetwear", "hoodie", "cap", "beanie", "залуус"],
    sourceUrls: ["https://kidult93.com/", "https://www.instagram.com/93kidult/"]
  },
  {
    id: "brand-calin",
    slug: "calin",
    name: "CALIN Ulaanbaatar",
    tier: "контемпорари",
    category: "made-to-order",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "CALIN Ulaanbaatar нь made-in-Ulaanbaatar, made-to-order өнгө аястай, эмэгтэй хувцасны boutique шинжтэй брэнд гэж dataset-д бүртгэгдэнэ.",
    verifiedNotesMn: ["CALIN-ийн social орчинд Ulaanbaatar-based clothing brand, made-to-order болон drop/collection шинжтэй мэдээлэл харагддаг.", "Дэлгэрэнгүй түүх, байгуулагдсан он зэрэг мэдээллийг гараар баталгаажуулах шаардлагатай."],
    aestheticMn: ["boutique", "эмэгтэйлэг", "minimal", "local-made"],
    signatureMaterialsMn: ["даавуу", "хөвөн", "хөнгөн материал"],
    productFocusMn: ["эмэгтэй хувцас", "made-to-order", "collection drop"],
    keywordsMn: ["calin", "калин", "улаанбаатар", "made to order", "boutique"],
    sourceUrls: ["https://www.instagram.com/calin.ulaanbaatar/"]
  },
  {
    id: "brand-toson-torgo",
    slug: "toson-torgo",
    name: "Toson Torgo",
    tier: "өв соёл",
    category: "traditional-deel",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Toson Torgo нь торго, дээл, үндэсний хувцас, баяр ёслолын хувцасны чиглэлтэй heritage брэнд.",
    verifiedNotesMn: ["Toson Torgo-ийн public page, shop мэдээлэлд дээл, торго, үндэсний хувцас, уламжлалт материалууд онцолдог.", "Цагаан сар болон Наадам зэрэг улирлын ёслолын хэрэглээнд тохирох брэндийн ангилалд оруулж болно."],
    aestheticMn: ["уламжлалт", "торго", "баярын", "өв соёл"],
    signatureMaterialsMn: ["торго", "brocade", "хээтэй даавуу"],
    productFocusMn: ["дээл", "торго", "үндэсний хувцас"],
    keywordsMn: ["toson torgo", "тосон торго", "дээл", "торго", "цагаан сар", "наадам"],
    sourceUrls: ["https://www.facebook.com/tosontorgo/", "https://tosontorgo.mn/"]
  },
  {
    id: "brand-uv",
    slug: "uv",
    name: "UV",
    tier: "контемпорари",
    category: "boutique-fashion",
    sourceConfidence: "low",
    location: "Монгол",
    bioMn: "UV нь contemporary boutique fashion чиглэлтэй seed record. Нийтийн эх сурвалж хязгаарлагдмал тул chatbot тодорхой бус мэдээлэл дээр болгоомжтой хариулна.",
    verifiedNotesMn: ["UV нэртэй брэндийн public мэдээлэл хязгаарлагдмал байна.", "Материал, түүх, product focus-ийг төслийн эзэмшигч гараар баталгаажуулах хэрэгтэй."],
    aestheticMn: ["contemporary", "boutique", "urban"],
    signatureMaterialsMn: ["даавуу", "хөвөн"],
    productFocusMn: ["эмэгтэй хувцас", "өдөр тутмын хувцас"],
    keywordsMn: ["uv", "contemporary", "boutique"],
    sourceUrls: []
  },
  {
    id: "brand-blu",
    slug: "blu",
    name: "BLU",
    tier: "street-contemporary",
    category: "casualwear",
    sourceConfidence: "low",
    location: "Монгол",
    bioMn: "BLU нь casual/street-contemporary чиглэлд ашиглаж болох seed record. Дэлгэрэнгүй public мэдээлэл дутуу тул баталгаажуулалт шаардлагатай.",
    verifiedNotesMn: ["BLU-ийн талаар dataset-д хангалттай баталгаатай public тайлбар хязгаарлагдмал байна.", "Chatbot энэ брэндийн тухай хариулахдаа 'Anoce dataset-д бүртгэгдсэнээр' гэж болгоомжтой хэлнэ."],
    aestheticMn: ["casual", "urban", "залуусын"],
    signatureMaterialsMn: ["хөвөн", "деним", "fleece"],
    productFocusMn: ["casualwear", "streetwear"],
    keywordsMn: ["blu", "блу", "casual", "streetwear"],
    sourceUrls: []
  },
  {
    id: "brand-michel-amazonka",
    slug: "michel-amazonka",
    name: "Michel&Amazonka",
    tier: "люкс",
    category: "pret-a-couture",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Michel&Amazonka нь Монголын luxury / pret-a-couture орон зайд хүчтэй харагддаг, өв соёлын reference, tailoring, ёслолын болон олон улсын дүр төрхтэй брэнд.",
    verifiedNotesMn: ["Албан ёсны сайт, олон улсын нийтлэлүүд Michel&Amazonka-г Улаанбаатарт төвтэй fashion house гэж харуулдаг.", "Олимпийн дүрэмт хувцас, heritage silhouette, embroidery, deel-inspired detail зэрэг сэдвээр олон нийтийн анхаарал татсан.", "Бодит факт хэлэхдээ зөвхөн dataset-д орсон баталгаатай тэмдэглэлээр хязгаарлах нь зөв."],
    aestheticMn: ["luxury", "heritage-modern", "tailored", "ceremonial", "editorial"],
    signatureMaterialsMn: ["ноолуур", "торго", "хатгамал", "tailoring fabric"],
    productFocusMn: ["couture", "formalwear", "ёслолын хувцас", "collection pieces"],
    keywordsMn: ["michel amazonka", "мишел амазонка", "luxury", "олимп", "дээл", "хатгамал", "tailoring"],
    sourceUrls: ["https://michelamazonka.com/", "https://www.instagram.com/michelamazonka/"]
  },
  {
    id: "brand-hoodie-house",
    slug: "hoodie-house-mongolia",
    name: "Hoodie House Mongolia",
    tier: "street-contemporary",
    category: "custom-hoodie",
    sourceConfidence: "medium",
    location: "Монгол",
    bioMn: "Hoodie House Mongolia нь hoodie, sweatshirt, personalized/custom casualwear чиглэлээр dataset-д орох street-casual брэнд.",
    verifiedNotesMn: ["Нэр болон social presence нь hoodie төвтэй casualwear байрлалтайг илтгэнэ.", "Custom design, материал, байгуулагдсан он зэрэг мэдээллийг гараар баталгаажуулах хэрэгтэй."],
    aestheticMn: ["hoodie", "custom", "comfortable", "youth casual"],
    signatureMaterialsMn: ["fleece", "хөвөн", "сүлжмэл"],
    productFocusMn: ["hoodie", "sweatshirt", "custom casualwear"],
    keywordsMn: ["hoodie house", "hoodie", "худи", "custom", "streetwear"],
    sourceUrls: ["https://www.facebook.com/hoodiehousemongolia/"]
  },
  {
    id: "brand-tumen-torgo",
    slug: "tumen-torgo",
    name: "Tumen Torgo",
    tier: "өв соёл",
    category: "traditional-deel",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Tumen Torgo нь үндэсний дээл, торго, уламжлалт хувцасны өргөн сонголттой heritage retail брэнд.",
    verifiedNotesMn: ["Tumen Torgo-ийн public page нь Монгол үндэсний дээл, хувцас, торгоны өргөн сонголттой гэж тайлбарладаг.", "Брэндийн сайт дээр Tumen Torgo Luxury, Standard, Minimal гэсэн ангиллууд харагддаг.", "Цагаан сарын торгон хээг Монгол уран бүтээлчид бүтээж, цэвэр торгон дээр нэхсэн тухай post дурдагдсан."],
    aestheticMn: ["уламжлалт", "торго", "баяр ёслол", "heritage retail"],
    signatureMaterialsMn: ["торго", "brocade", "уламжлалт нэхмэл"],
    productFocusMn: ["дээл", "торго", "үндэсний хувцас"],
    keywordsMn: ["tumen torgo", "түмэн торго", "дээл", "торго", "уламжлалт", "цагаан сар", "наадам"],
    sourceUrls: ["https://www.facebook.com/tumentorgo/", "https://tumentorgo.mn/mn/brands"]
  },
  {
    id: "brand-oyut",
    slug: "oyut",
    name: "OYUT Mongolian Brand",
    tier: "контемпорари",
    category: "mongolian-made",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "OYUT нь Mongolian-made, accessible timeless clothing, custom color option, local retail өнгө аястай contemporary брэнд.",
    verifiedNotesMn: ["OYUT public pages нь Made with Love гэсэн байрлалтай Монгол clothing brand гэж харуулдаг.", "OyutBasic story page-д Oyuntsetseg Batdelger-ийг founder гэж нэрлэж, timeless Mongolian-made clothing-ийг USA-д илүү хүртээмжтэй болгох зорилгыг дурдсан.", "Public posts-д олон өнгөний сонголт, made-to-order/custom color боломжийн талаар дурдсан."],
    aestheticMn: ["timeless", "зөөлөн casual", "accessible", "made with love"],
    signatureMaterialsMn: ["хөвөн", "сүлжмэл", "даавуу"],
    productFocusMn: ["цамц", "өдөр тутмын хувцас", "custom color piece"],
    keywordsMn: ["oyut", "оюут", "made with love", "mongolian brand", "timeless", "custom color"],
    sourceUrls: ["https://www.facebook.com/p/OYUT-Mongolian-Brand-100067900705357/", "https://oyutbasic.com/blogs/news/our-story"]
  },
  {
    id: "brand-durvun-arvait",
    slug: "durvun-arvait",
    name: "Дөрвөн Арвайт",
    tier: "өв соёл",
    category: "traditional-cultural",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "Дөрвөн Арвайт нь уламжлалт хувцас, хадаг, гоёл чимэглэл, Монгол өв соёлын сэдэвтэй heritage чиглэлийн брэнд/хуудас гэж dataset-д орно.",
    verifiedNotesMn: ["Public хуудсууд Дөрвөн Арвайтыг уламжлалт хувцас, Монгол бахархлын хэллэгтэйгээр харуулдаг.", "Instagram content-д халх эхнэрийн хувцас, гоёл, уламжлалт чимэглэлийн судалгааны шинжтэй мэдээлэл харагддаг."],
    aestheticMn: ["өв соёл", "угсаатны хувцас", "ёслолын", "соёлын судалгаа"],
    signatureMaterialsMn: ["хадаг", "уламжлалт нэхмэл", "чимэглэл"],
    productFocusMn: ["уламжлалт хувцас", "хадаг", "соёлын аксессуар"],
    keywordsMn: ["дөрвөн арвайт", "durvun arvait", "уламжлалт хувцас", "хадаг", "халх", "өв соёл"],
    sourceUrls: ["https://www.facebook.com/p/%D0%94%D3%A9%D1%80%D0%B2%D3%A9%D0%BD-%D0%B0%D1%80%D0%B2%D0%B0%D0%B9%D1%82-%D0%B1%D1%80%D1%8D%D0%BD%D0%B4-100066735243173/", "https://www.instagram.com/durvun_arvait_brand/"]
  },
  {
    id: "brand-shilmel-zagvar",
    slug: "shilmel-zagvar",
    name: "Shilmel Zagvar",
    tier: "institutional-heritage",
    category: "fashion-house",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Shilmel Zagvar нь Монголын урт түүхтэй fashion institution бөгөөд захиалгат, биед тааруулсан, one-of-a-kind хувцас болон загварын салбарын түүхтэй холбоотой.",
    verifiedNotesMn: ["Албан ёсны сайт нь Shilmel Zagvar-ыг 1972 онд Fashion Design Bureau нэрээр байгуулагдаж, 1992 онд хувьчлагдан Shilmel Zagvar LLC болсон гэж дурдсан.", "Сайт нь хэрэглэгчийн биеийн хэмжээнд тааруулсан custom one-of-a-kind garments санал болгодог гэж танилцуулдаг."],
    aestheticMn: ["classic fashion house", "захиалгат хувцас", "institutional", "tailored"],
    signatureMaterialsMn: ["tailoring fabric", "формал даавуу", "дүрэмт хувцасны даавуу"],
    productFocusMn: ["захиалгат хувцас", "fashion design", "дүрэмт хувцас", "загварын арга хэмжээ"],
    keywordsMn: ["shilmel zagvar", "шилмэл загвар", "fashion house", "захиалгат хувцас", "1972", "tailoring"],
    sourceUrls: ["https://www.shilmelzagvar.mn/", "https://shilmelzagvar.mn/indexmon.html"]
  },
  {
    id: "brand-atoz",
    slug: "atoz",
    name: "ATOZ",
    tier: "контемпорари",
    category: "womenswear",
    sourceConfidence: "medium",
    location: "Улаанбаатар, Монгол",
    bioMn: "ATOZ нь blouse, skirt, dress, T-shirt зэрэг эмэгтэй хувцас, collection/drop-based social commerce өнгө аястай Ulaanbaatar womenswear брэнд.",
    verifiedNotesMn: ["ATOZ public pages нь Ulaanbaatar clothing brand, retail location-той гэж харуулдаг.", "Shoppy listings-д silk dress, horse T-shirt, flower skirt, horse dress, pink blouse, bow skirt зэрэг бүтээгдэхүүн харагддаг.", "Public posts-д FW2025/NY collection detail дурдагдсан."],
    aestheticMn: ["эмэгтэйлэг", "тоглоомтой", "dressy-casual", "boutique"],
    signatureMaterialsMn: ["торго", "хөвөн", "хөнгөн даавуу"],
    productFocusMn: ["даашинз", "blouse", "юбка", "t-shirt"],
    keywordsMn: ["atoz", "эйтоз", "blouse", "юбка", "даашинз", "boutique", "womenswear"],
    sourceUrls: ["https://www.facebook.com/atoz.by.atoz/", "https://shoppy.mn/brands/atoz", "https://www.instagram.com/atoz.by.atoz/"]
  },
  {
    id: "brand-podolk",
    slug: "podolk",
    name: "Podolk",
    tier: "street-contemporary",
    category: "graphic-basics",
    sourceConfidence: "high",
    location: "Улаанбаатар, Монгол",
    bioMn: "Podolk нь graphic basic болон street-casual чиглэлтэй, T-shirt, hoodie, sweatshirt, tote bag, accessories төвтэй Монгол брэнд.",
    verifiedNotesMn: ["Podolk-ийн албан ёсны сайт Essentials Capsule collection, T-shirts, hoodies, PawDolk, sweatshirts, tote bags, accessories зэрэг category харуулдаг.", "Бүтээгдэхүүний хуудсууд graphic T-shirt болон casualwear ангиллуудтай."],
    aestheticMn: ["graphic", "хошин өнгө", "casual", "youth streetwear"],
    signatureMaterialsMn: ["хөвөн", "fleece"],
    productFocusMn: ["t-shirt", "hoodie", "sweatshirt", "tote bag", "accessories"],
    keywordsMn: ["podolk", "подолк", "t-shirt", "hoodie", "graphic", "casual", "streetwear"],
    sourceUrls: ["https://podolk.com/", "https://podolk.com/products?page=3"]
  }
];

export const anoceTrendsMn: AnoceTrendMn[] = [
  {
    id: "trend-mn-cashmere-core",
    titleMn: "Монгол ноолуур өдөр тутмын люкс хэлбэрээр",
    year: 2026,
    seasonMn: "Бүх улирал",
    summaryMn: "Anoce dataset-д ноолуур нь Монгол fashion-ийн хамгийн хүчтэй давтагдах дохио болж харагдана. Брэндүүд ноолуурыг пальто, свитер, ёслолын дээл, wardrobe basic зэрэгт ашигладаг.",
    keywordsMn: ["ноолуур", "зөөлөн люкс", "өвлийн давхарлалт", "сүлжмэл"],
    materialsMn: ["ноолуур", "сарлагийн хөөвөр", "тэмээний ноос", "ноос"],
    moodsMn: ["зөөлөн", "дулаан", "timeless", "премиум"],
    relatedBrandIds: ["brand-gobi", "brand-goyol", "brand-goyo", "brand-evseg", "brand-negun", "brand-michel-amazonka"]
  },
  {
    id: "trend-mn-deel-reinterpretation",
    titleMn: "Дээлэн силуэт ба ёслолын хувцасны шинэ тайлбар",
    year: 2026,
    seasonMn: "Наадам / Цагаан сар",
    summaryMn: "Дээлний бүтэц, торгон гадаргуу, өндөр зах, хатгамал ирмэг, ёслолын аксессуар зэрэг нь Anoce archive-ийн гол өв соёлын сэдэв болно.",
    keywordsMn: ["дээл", "өв соёл", "ёслол", "хатгамал", "торго"],
    materialsMn: ["торго", "brocade", "ноолууран даавуу", "хатгамал"],
    moodsMn: ["ёслолын", "хааны мэт", "өв соёл", "формал"],
    relatedBrandIds: ["brand-torgo", "brand-toson-torgo", "brand-tumen-torgo", "brand-michel-amazonka", "brand-durvun-arvait"]
  },
  {
    id: "trend-ub-streetwear",
    titleMn: "Улаанбаатарын street-casual тав тух",
    year: 2026,
    seasonMn: "Бүх улирал",
    summaryMn: "Залуу Монгол брэндүүд hoodie, tee, denim, cap, graphic, comfort fit, unisex casualwear чиглэлээр street-casual урсгалыг харуулж байна.",
    keywordsMn: ["hoodie", "t-shirt", "деним", "unisex", "graphic", "тав тух"],
    materialsMn: ["хөвөн", "fleece", "деним", "сүлжмэл"],
    moodsMn: ["залуу", "тав тухтай", "casual", "urban"],
    relatedBrandIds: ["brand-urban-jeans", "brand-kuvcas", "brand-kidult", "brand-hoodie-house", "brand-blu", "brand-podolk"]
  },
  {
    id: "trend-mn-custom-made",
    titleMn: "Made-to-order ба custom fit соёл",
    year: 2026,
    seasonMn: "Бүх улирал",
    summaryMn: "Зарим Монгол брэндүүд custom sizing, made-to-order, биед тааруулсан хувцас, хэрэглэгчийн хүсэлтээр өөрчилсөн hoodie зэрэг boutique production соёлыг харуулдаг.",
    keywordsMn: ["made to order", "custom fit", "boutique", "personalized", "захиалгат"],
    materialsMn: ["tailoring fabric", "хөвөн", "ноос", "торго"],
    moodsMn: ["хувийн", "boutique", "урласан", "local"],
    relatedBrandIds: ["brand-shilmel-zagvar", "brand-calin", "brand-hoodie-house", "brand-oyut"]
  },
  {
    id: "trend-mn-heritage-modern",
    titleMn: "Өв соёл ба modern silhouette-ийн нийлэмж",
    year: 2026,
    seasonMn: "Бүх улирал",
    summaryMn: "Монгол fashion dataset-д уламжлалт дээл, торго, хатгамал, ноолуур, хотын minimal silhouette зэрэг нь шууд хуулбар биш харин орчин үеийн хэрэглээнд дахин тайлбарлагдсан хэлбэрээр давтагдана.",
    keywordsMn: ["heritage modern", "дээлэн силуэт", "minimal", "tailoring", "монгол хэв маяг"],
    materialsMn: ["торго", "ноолуур", "ноос", "хатгамал"],
    moodsMn: ["editorial", "орчин үеийн", "үндэсний", "тансаг"],
    relatedBrandIds: ["brand-michel-amazonka", "brand-torgo", "brand-tumen-torgo", "brand-gobi", "brand-goyol"]
  }
];

export const ANOCE_CHATBOT_SYSTEM_PROMPT_MN = `Чи Anoce нэртэй Монгол fashion archive/editorial website-ийн AI туслах.

Дүрэм:
1. Зөвхөн өгөгдсөн Anoce context дээр тулгуурлаж хариул.
2. Context-д байхгүй мэдээллийг зохиож болохгүй.
3. Баталгаатай биш brand дээр "Anoce dataset-д бүртгэгдсэнээр" эсвэл "одоогоор public мэдээлэл хязгаарлагдмал" гэж болгоомжтой хэл.
4. Хариултыг Монгол хэлээр, товч, editorial өнгө аястай өг.
5. Хэрэглэгч trend асуувал "Anoce dataset дээр үндэслэвэл" гэж эхэл.
6. Боломжтой бол холбоотой brand, материал, mood, category-г санал болго.
7. Хангалттай context олдохгүй бол "Anoce archive-д энэ талаар хангалттай мэдээлэл алга" гэж хэлээд хайж болох keyword санал болго.`;

function brandToContent(brand: AnoceBrandMn): string {
  return [
    `Төрөл: Брэнд`,
    `Нэр: ${brand.name}`,
    `Slug: ${brand.slug}`,
    `Tier: ${brand.tier}`,
    `Ангилал: ${brand.category}`,
    `Байршил: ${brand.location}`,
    `Итгэлцлийн түвшин: ${brand.sourceConfidence}`,
    `Товч танилцуулга: ${brand.bioMn}`,
    `Баталгаатай тэмдэглэл: ${brand.verifiedNotesMn.join(" ")}`,
    `Гоо зүй / mood: ${brand.aestheticMn.join(", ")}`,
    `Гол материал: ${brand.signatureMaterialsMn.join(", ")}`,
    `Бүтээгдэхүүний чиглэл: ${brand.productFocusMn.join(", ")}`,
    `Keyword: ${brand.keywordsMn.join(", ")}`,
    `Anoce URL: /designers/${brand.slug}`,
  ].join("\n");
}

function trendToContent(trend: AnoceTrendMn): string {
  const relatedBrands = trend.relatedBrandIds
    .map((id) => anoceBrandsMn.find((brand) => brand.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return [
    `Төрөл: Trend report`,
    `Гарчиг: ${trend.titleMn}`,
    `Он: ${trend.year}`,
    `Улирал: ${trend.seasonMn}`,
    `Тайлбар: ${trend.summaryMn}`,
    `Keyword: ${trend.keywordsMn.join(", ")}`,
    `Материал: ${trend.materialsMn.join(", ")}`,
    `Mood: ${trend.moodsMn.join(", ")}`,
    `Холбоотой брэндүүд: ${relatedBrands}`,
    `Anoce URL: /explore?trend=${trend.id}`,
  ].join("\n");
}

export const anoceRagDocumentsMn: AnoceRagDocumentMn[] = [
  ...anoceBrandsMn.map((brand) => ({
    id: `rag-${brand.id}`,
    type: "brand" as const,
    title: brand.name,
    content: brandToContent(brand),
    sourceConfidence: brand.sourceConfidence,
    url: `/designers/${brand.slug}`,
    sourceUrls: brand.sourceUrls,
    metadata: {
      brandId: brand.id,
      slug: brand.slug,
      tier: brand.tier,
      category: brand.category,
      materials: brand.signatureMaterialsMn,
      moods: brand.aestheticMn,
      keywords: brand.keywordsMn,
    },
  })),
  ...anoceTrendsMn.map((trend) => ({
    id: `rag-${trend.id}`,
    type: "trend" as const,
    title: trend.titleMn,
    content: trendToContent(trend),
    sourceConfidence: "medium" as const,
    url: `/explore?trend=${trend.id}`,
    metadata: {
      trendId: trend.id,
      materials: trend.materialsMn,
      moods: trend.moodsMn,
      keywords: trend.keywordsMn,
      relatedBrandIds: trend.relatedBrandIds,
    },
  })),
  {
    id: "rag-guide-anoce-scope",
    type: "guide",
    title: "Anoce chatbot-ийн хариулах хүрээ",
    sourceConfidence: "high",
    url: "/explore",
    metadata: { keywords: ["chatbot", "хүрээ", "trend", "брэнд", "материал", "зөвлөмж"], moods: ["archive", "editorial"], materials: [] },
    content: [
      "Төрөл: Chatbot guide",
      "Anoce AI туслах нь Монгол fashion archive дээр тулгуурлан брэнд, материал, mood, trend, category, product focus, heritage-modern холбоосыг тайлбарлана.",
      "Chatbot нь live web search хийхгүй. Trend-ийн тухай хариулахдаа зөвхөн Anoce dataset дээр үндэслэнэ.",
      "Сайн асуултын жишээ: Монгол fashion-д ямар trend байна вэ? Ноолуур ашигладаг брэндүүдийг харуул. Streetwear брэндүүд аль нь вэ? Дээлэн silhouette ашигладаг брэндүүд? Dark luxury mood-тэй брэнд санал болго.",
      "Мэдээлэл хүрэлцэхгүй бол context байхгүй гэж хэлээд keyword санал болгоно."
    ].join("\n")
  }
];

const synonymMap: Record<string, string[]> = {
  "ноолуур": ["cashmere", "gobi", "goyo", "goyol", "evseg", "нэгүн", "negun"],
  "дээл": ["deel", "торго", "torgo", "tumen", "toson", "ёслол", "өв соёл"],
  "streetwear": ["hoodie", "худи", "street", "casual", "urban", "kidult", "kuvcas", "podolk", "blu"],
  "жийнс": ["jeans", "denim", "urban jeans"],
  "торго": ["silk", "torgo", "tumen torgo", "toson torgo"],
  "хатгамал": ["embroidery", "heritage", "michel", "amazonka"],
  "захиалгат": ["custom", "made to order", "tailoring", "shilmel", "calin", "hoodie house"],
  "люкс": ["luxury", "premium", "gobi", "goyol", "michel", "amazonka", "cashmere"],
  "өвөл": ["winter", "ноолуур", "wool", "пальто", "coat", "layering"]
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]"']/g, " ").replace(/\s+/g, " ").trim();
}

function expandQuery(query: string): string[] {
  const normalized = normalizeText(query);
  const terms = new Set(normalized.split(" ").filter(Boolean));
  Object.entries(synonymMap).forEach(([key, synonyms]) => {
    if (normalized.includes(key) || synonyms.some((synonym) => normalized.includes(synonym))) {
      terms.add(key);
      synonyms.forEach((synonym) => synonym.split(" ").forEach((part) => terms.add(part)));
    }
  });
  return Array.from(terms).filter((term) => term.length > 1);
}

function scoreDocument(query: string, document: AnoceRagDocumentMn): number {
  const terms = expandQuery(query);
  if (terms.length === 0) return 0;

  const title = normalizeText(document.title);
  const content = normalizeText(document.content);
  const metadata = normalizeText([
    document.metadata.tier,
    document.metadata.category,
    ...(document.metadata.materials ?? []),
    ...(document.metadata.moods ?? []),
    ...(document.metadata.keywords ?? []),
  ].filter(Boolean).join(" "));

  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 8;
    if (metadata.includes(term)) score += 5;
    if (content.includes(term)) score += 2;
  }

  if (document.sourceConfidence === "high") score += 1;
  if (document.type === "trend" && /trend|трэнд|чиг хандлага|одоо|моод/i.test(query)) score += 6;
  if (document.type === "brand" && /брэнд|brand|designer|дизайнер/i.test(query)) score += 3;
  return score;
}

export function retrieveAnoceRagContextMn(query: string, options: { limit?: number; minScore?: number; includeLowConfidence?: boolean } = {}): AnoceRagDocumentMn[] {
  const limit = options.limit ?? 6;
  const minScore = options.minScore ?? 2;
  const includeLowConfidence = options.includeLowConfidence ?? true;

  return anoceRagDocumentsMn
    .map((document) => ({ document, score: scoreDocument(query, document) }))
    .filter(({ document, score }) => score >= minScore && (includeLowConfidence || document.sourceConfidence !== "low"))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document }) => document);
}

export function buildAnoceChatbotContextMn(query: string, options: { limit?: number; minScore?: number; includeLowConfidence?: boolean } = {}): string {
  const docs = retrieveAnoceRagContextMn(query, options);
  if (docs.length === 0) return "Anoce archive-д энэ асуултад тохирох context олдсонгүй.";

  return docs.map((doc, index) => [
    `# Эх сурвалж ${index + 1}: ${doc.title}`,
    `Document ID: ${doc.id}`,
    `Type: ${doc.type}`,
    `Confidence: ${doc.sourceConfidence}`,
    `Anoce URL: ${doc.url}`,
    doc.content,
  ].join("\n")).join("\n\n---\n\n");
}

export function buildAnoceUserPromptMn(userQuestion: string): string {
  const context = buildAnoceChatbotContextMn(userQuestion, { limit: 7, minScore: 2 });
  return [
    "Доорх Anoce context дээр тулгуурлан хэрэглэгчийн асуултад Монгол хэлээр хариул.",
    "Context-д байхгүй факт зохиож болохгүй.",
    "Хэрэв context сул байвал шууд хэл.",
    "",
    "[ANOCE CONTEXT]",
    context,
    "",
    "[USER QUESTION]",
    userQuestion,
  ].join("\n");
}

export function searchAnoceBrandsMn(query: string, limit = 8): AnoceBrandMn[] {
  return retrieveAnoceRagContextMn(query, { limit, minScore: 2 })
    .filter((doc) => doc.type === "brand")
    .map((doc) => anoceBrandsMn.find((brand) => brand.id === doc.metadata.brandId))
    .filter((brand): brand is AnoceBrandMn => Boolean(brand));
}

export function getAnoceBrandBySlugMn(slug: string): AnoceBrandMn | undefined {
  return anoceBrandsMn.find((brand) => brand.slug === slug);
}

export function getAnoceBrandByIdMn(id: string): AnoceBrandMn | undefined {
  return anoceBrandsMn.find((brand) => brand.id === id);
}

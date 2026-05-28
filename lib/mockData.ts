import { Article, Collection, Designer, User } from "./types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&h=1600&fit=crop&auto=format`;

export const designers: Designer[] = [
  {
    id: "designer:gobi-cashmere",
    slug: "gobi-cashmere",
    name: "Gobi Cashmere",
    brand: "Gobi",
    tier: "high-end",
    nationality: "Монгол",
    founded: 1981,
    activeSeasons: 12,
    shortBio: "Монгол ноолуурыг орчин үеийн тансаг хэрэглээнд хүргэсэн брэнд.",
    bio: "Gobi Cashmere нь Монгол ноолуурын зөөлөн чанар, дулаан мэдрэмж, минимал хэлбэрийг нэгтгэн харуулдаг. Цуглуулгууд нь тал нутгийн өнгө, улирлын уур амьсгал, өдөр тутамд өмсөх боломжтой тансаг байдлыг онцолдог.",
    profileImage: img("photo-1496747611176-843222e1e57c"),
    coverImage: img("photo-1483985988355-763728e1935b"),
    socialLinks: { instagram: "@gobicashmere", website: "https://gobicashmere.com" },
  },
  {
    id: "designer:goyol-studio",
    slug: "goyol-studio",
    name: "Goyol Studio",
    brand: "Goyol",
    tier: "contemporary",
    nationality: "Монгол",
    founded: 2014,
    activeSeasons: 8,
    shortBio: "Уламжлалт хэлбэрийг хотын орчин үеийн хувцастай холбодог студи.",
    bio: "Goyol Studio нь дээлэн зах, торгон гадаргуу, гар хатгамлын ишлэлийг цэвэрхэн эсгүүр, давхарлалт, хотын өдөр тутмын хэв маягтай хослуулдаг. Брэндийн өнгө аяс нь өв соёлыг шууд хуулбарлахгүй, харин шинэ хэрэглээнд тохируулан тайлбарлахад төвлөрдөг.",
    profileImage: img("photo-1509631179647-0177331693ae"),
    coverImage: img("photo-1490481651871-ab68de25d43d"),
    socialLinks: { instagram: "@goyolstudio" },
  },
  {
    id: "designer:nomin-d",
    slug: "nomin-d",
    name: "Nomin D",
    brand: "Nomin D",
    tier: "emerging",
    nationality: "Монгол",
    founded: 2021,
    activeSeasons: 3,
    shortBio: "Дээлэн силуэтийг шинэ үеийн өнцгөөр задлан бүтээдэг дизайнер.",
    bio: "Nomin D нь уламжлалт дээлний хаалт, бүс, давхарлагаас санаа авч, тэдгээрийг асимметрик эсгүүр, металл тоног, бараан өнгийн ноосон материалтай холбон бүтээдэг. Түүний ажил Монгол хувцасны хэлбэрийг залуу үеийн хотын хэлээр дахин уншуулахыг зорьдог.",
    profileImage: img("photo-1529139574466-a303027c1d8b"),
    coverImage: img("photo-1515886657613-9f3515b0c78f"),
    socialLinks: { instagram: "@nomind.studio" },
  },
];

export const collections: Collection[] = [
  {
    id: "collection:gobi-fw2025-steppe-silence",
    slug: "gobi-fw2025-steppe-silence",
    title: "Талын нам гүм",
    designerId: "designer:gobi-cashmere",
    designerName: "Gobi Cashmere",
    designerSlug: "gobi-cashmere",
    season: "FW",
    year: 2025,
    description:
      "Өвлийн тал нутгийн нам гүм, цайвар өвс, хүйтэн салхины өнгөнөөс санаа авсан ноолуурын цуглуулга.",
    coverImage: img("photo-1515372039744-b8f02a3ae446"),
    looks: [
      {
        id: "gobi-fw25-look-1",
        number: 1,
        image: img("photo-1485968579580-b6d095142e6e"),
        description: "Зааны ясан өнгийн сул ноолууран пальто.",
        materials: ["ноолуур", "торгон дотор"],
        tags: ["пальто", "ноолуур", "өвөл"],
      },
      {
        id: "gobi-fw25-look-2",
        number: 2,
        image: img("photo-1509631179647-0177331693ae"),
        description: "Нүүрсэн саарал өндөр захтай сүлжмэл, өргөн өмдтэй хослол.",
        materials: ["ноолуур", "ноосон хольц"],
        tags: ["сүлжмэл", "саарал", "давхарлалт"],
      },
    ],
  },
  {
    id: "collection:goyol-ss2025-nomadic-bloom",
    slug: "goyol-ss2025-nomadic-bloom",
    title: "Нүүдлийн цэцэгс",
    designerId: "designer:goyol-studio",
    designerName: "Goyol Studio",
    designerSlug: "goyol-studio",
    season: "SS",
    year: 2025,
    description:
      "Хаврын богинохон дэлгэрэлт, торгон давхарлалт, хатгамлын зөөлөн өнгөөр бүтээгдсэн хөнгөн цуглуулга.",
    coverImage: img("photo-1490481651871-ab68de25d43d"),
    looks: [
      {
        id: "goyol-ss25-look-1",
        number: 1,
        image: img("photo-1483985988355-763728e1935b"),
        description: "Торгон органза давхар цамц, цэцгэн хийсвэр хээтэй.",
        materials: ["торго", "хөвөн"],
        tags: ["торго", "хавар", "цэцгэн"],
      },
      {
        id: "goyol-ss25-look-2",
        number: 2,
        image: img("photo-1529139574466-a303027c1d8b"),
        description: "Тоосон ягаан маалинган өргөн өмд, хатгамал ирмэгтэй.",
        materials: ["маалинган даавуу", "хөвөн утас"],
        tags: ["өмд", "хатгамал", "зун"],
      },
    ],
  },
];

export const articles: Article[] = [
  {
    id: "article:mongol-nooluuriin-shine-une-tsene",
    slug: "mongol-nooluuriin-shine-une-tsene",
    title: "Монгол ноолуурын шинэ үнэ цэнэ",
    subtitle: "Түүхий эдээс брэндийн өгүүлэмж хүртэл",
    category: "features",
    author: "Anoce редакц",
    publishedAt: "2026-04-30T00:00:00.000Z",
    coverImage: img("photo-1515886657613-9f3515b0c78f"),
    designerSlug: "gobi-cashmere",
    tags: ["ноолуур", "gobi", "heritage"],
    readTime: 6,
    status: "published",
    body:
      "Монгол ноолуур олон жилийн турш дэлхийн тансаг хэрэглээний зах зээлд түүхий эдийн нэрээр танигдсан. Харин шинэ үеийн брэндүүд энэ материалыг зөвхөн экспортын бүтээгдэхүүн биш, газар нутаг, малчин өрх, гар урлал, орчин үеийн дизайны нийлбэр өгүүлэмж болгон харуулж байна.\n\nGobi Cashmere зэрэг брэндүүд материалын чанар, тайван өнгө, удаан эдэлгээтэй хэлбэрийг онцолж, Монгол ноолуурыг өдөр тутмын тансаг хэрэглээний хэлээр илэрхийлдэг. Энэ шилжилт нь дотоодын үйлдвэрлэлд үнэ цэнэ нэмж, хэрэглэгчдэд бүтээгдэхүүний ар дахь гарал үүслийг ойлгуулах боломжийг нээж байна.",
  },
  {
    id: "article:goyol-studio-yariltslaga",
    slug: "goyol-studio-yariltslaga",
    title: "Goyol Studio: өв соёлыг шууд хуулбарлахгүй",
    subtitle: "Орчин үеийн Монгол загварын хэлбэрийн тухай ярилцлага",
    category: "interviews",
    author: "Anoce редакц",
    publishedAt: "2026-05-02T00:00:00.000Z",
    coverImage: img("photo-1496747611176-843222e1e57c"),
    designerSlug: "goyol-studio",
    tags: ["ярилцлага", "торго", "дээл"],
    readTime: 8,
    status: "published",
    body:
      "Goyol Studio-ийн хувьд уламжлал гэдэг нь музейн шилэн хоргонд үлдээх зүйл биш. Харин өнөөдрийн хотын хэмнэл, хөдөлгөөн, хувийн хэв маягтай хамт амьдрах боломжтой хэлбэр юм.\n\nДизайнерууд дээлний зах, бүсний зангилаа, торгон гадаргуу гэх мэт танил дохиог авч, илүү цэвэрхэн эсгүүр, сул силуэт, давхар өмсөх боломжтой бүтцээр шинэчилдэг. Иймээс тэдний ажил Монгол хувцсыг хуулбарлахаас илүү дахин унших оролдлого болж харагддаг.",
  },
  {
    id: "article:ub-street-style",
    slug: "ub-street-style",
    title: "Улаанбаатарын гудамжны стиль",
    subtitle: "Хүйтэн уур амьсгал, давхарлалт, залуу үеийн өөрийн хэл",
    category: "trends",
    author: "Anoce редакц",
    publishedAt: "2026-05-05T00:00:00.000Z",
    coverImage: img("photo-1483985988355-763728e1935b"),
    tags: ["street style", "улаанбаатар", "давхарлалт"],
    readTime: 5,
    status: "published",
    body:
      "Улаанбаатарын гудамжны стиль цаг агаарын бодит шаардлагаас эхэлдэг. Давхарлалт, дулаан материал, том хэмжээтэй гадуур хувцас, ажиллагаатай цүнх, гутал нь гоёлын сонголт төдийгүй өдөр тутмын хэрэгцээ юм.\n\nСүүлийн жилүүдэд залуу брэндүүд hoodie, cargo өмд, сүлжмэл эдлэл, дээлэн элементүүдийг хамтад нь ашиглаж, хотын өөрийн дүр төрхийг бүрдүүлж байна. Энэ нь гаднын чиг хандлагыг хуулбарлах бус, Монгол хотын амьдралд таарсан загварын хэл болж байна.",
  },
];

export const users: User[] = [
  {
    id: "user:admin",
    name: "Админ",
    email: "admin@anoce.mn",
    role: "admin",
    avatar: "",
    joinedAt: "2026-01-01T00:00:00.000Z",
    savedArticles: ["article:mongol-nooluuriin-shine-une-tsene"],
    savedLooks: ["gobi-fw25-look-1"],
  },
];

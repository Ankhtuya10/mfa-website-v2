export type ArchiveTaxonomyOption = {
  value: string;
  label: string;
  keywords: string[];
};

const option = (
  value: string,
  label: string,
  keywords: string[] = [],
): ArchiveTaxonomyOption => ({
  value,
  label,
  keywords: [label, value, ...keywords],
});

export const ARCHIVE_SEASON_OPTIONS = [
  { value: "SS", label: "Хавар/Зун" },
  { value: "FW", label: "Намар/Өвөл" },
  { value: "Pre-Fall", label: "Намрын өмнөх" },
  { value: "Resort", label: "Амралтын улирал" },
] as const;

export const ARCHIVE_CATEGORY_OPTIONS = [
  option("streetwear", "Streetwear", [
    "street style",
    "street",
    "urban",
    "hoodie",
    "oversized",
  ]),
  option("sport-outfits", "Спорт хувцас", [
    "sport",
    "sportswear",
    "activewear",
    "athletic",
    "tracksuit",
    "jersey",
    "training",
  ]),
  option("outerwear", "Гадуур хувцас", [
    "outerwear",
    "coat",
    "jacket",
    "parka",
    "trench",
    "bomber",
  ]),
  option("knitwear", "Сүлжмэл", [
    "knit",
    "knitwear",
    "cardigan",
    "sweater",
    "turtleneck",
  ]),
  option("tailoring", "Оёдол/костюм", [
    "tailor",
    "tailored",
    "suit",
    "suiting",
    "blazer",
    "trouser",
  ]),
  option("eveningwear", "Оройн хувцас", [
    "evening",
    "gown",
    "cocktail",
    "formal",
    "dressy",
  ]),
  option("casualwear", "Өдөр тутмын хувцас", [
    "casual",
    "everyday",
    "daily",
    "basic",
  ]),
  option("dresses", "Даашинз", ["dress", "gown", "slip dress"]),
  option("denim", "Denim", ["denim", "jean", "jeans"]),
  option("footwear", "Гутал", [
    "footwear",
    "shoe",
    "boot",
    "sneaker",
    "loafer",
    "heel",
    "sandals",
  ]),
  option("accessories", "Аксессуар", [
    "accessory",
    "bag",
    "belt",
    "scarf",
    "hat",
    "jewelry",
    "jewellery",
  ]),
  option("traditional", "Уламжлалт хувцас", [
    "deel",
    "traditional",
    "heritage",
    "үндэсний",
  ]),
] as const;

export const ARCHIVE_MATERIAL_OPTIONS = [
  option("cashmere", "Ноолуур", ["cashmere"]),
  option("wool", "Ноос", ["wool"]),
  option("silk", "Торго", ["silk"]),
  option("leather", "Арьс", ["leather"]),
  option("denim", "Denim", ["denim"]),
  option("cotton", "Хөвөн", ["cotton"]),
  option("fleece", "Fleece", ["fleece"]),
  option("technical-nylon", "Техник нейлон", ["nylon", "technical"]),
  option("mesh", "Mesh", ["mesh", "net"]),
  option("satin", "Сатин", ["satin"]),
  option("linen", "Маалинган", ["linen"]),
  option("velvet", "Velvet", ["velvet"]),
  option("faux-fur", "Хиймэл үслэг", ["faux fur", "fur"]),
] as const;

export const ARCHIVE_COLOR_OPTIONS = [
  option("black", "Хар", ["black"]),
  option("white", "Цагаан", ["white"]),
  option("grey", "Саарал", ["gray", "grey"]),
  option("beige", "Beige", ["beige", "cream", "ivory"]),
  option("brown", "Brown", ["brown", "chocolate"]),
  option("red", "Улаан", ["red"]),
  option("pink", "Ягаан", ["pink"]),
  option("blue", "Цэнхэр", ["blue"]),
  option("green", "Ногоон", ["green"]),
  option("yellow", "Шар", ["yellow"]),
  option("silver", "Мөнгөлөг", ["silver"]),
  option("gold", "Алтлаг", ["gold"]),
  option("pastel", "Pastel", ["pastel"]),
  option("monochrome", "Monochrome", ["monochrome", "black and white"]),
] as const;

export const ARCHIVE_OCCASION_OPTIONS = [
  option("everyday", "Everyday", ["daily", "casual"]),
  option("office", "Office", ["workwear", "business"]),
  option("evening", "Evening", ["night", "formal", "cocktail"]),
  option("sport", "Sport", ["sportswear", "training", "athletic"]),
  option("outdoor", "Outdoor", ["utility", "hiking", "weather"]),
  option("travel", "Travel", ["resort", "cruise", "vacation"]),
  option("festival", "Festival", ["party", "event"]),
  option("performance", "Performance", ["stage", "dance"]),
  option("wedding", "Wedding", ["bridal", "ceremony"]),
] as const;

type ArchiveValues = {
  categories: string[];
  materials: string[];
  colors: string[];
  occasions: string[];
};

type ArchiveCollectionLike = Partial<ArchiveValues> & {
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  looks?: unknown;
};

const normalize = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase();

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];

const allOptions = [
  ...ARCHIVE_CATEGORY_OPTIONS,
  ...ARCHIVE_MATERIAL_OPTIONS,
  ...ARCHIVE_COLOR_OPTIONS,
  ...ARCHIVE_OCCASION_OPTIONS,
];

const canonicalLabels = new Map(
  allOptions.flatMap((item) => [
    [normalize(item.label), item.label],
    [normalize(item.value), item.label],
  ]),
);

function canonicalize(value: unknown) {
  const clean = String(value || "").trim();
  return canonicalLabels.get(normalize(clean)) || clean;
}

export function mergeArchiveValues(...groups: unknown[]) {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const group of groups) {
    for (const rawValue of toStringArray(group)) {
      const value = canonicalize(rawValue);
      const key = normalize(value);
      if (!value || seen.has(key)) continue;
      seen.add(key);
      values.push(value);
    }
  }

  return values;
}

function matchesOption(text: string, item: ArchiveTaxonomyOption) {
  return item.keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) return false;
    if (/^[a-z0-9 -]+$/.test(normalizedKeyword)) {
      const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text);
    }
    return text.includes(normalizedKeyword);
  });
}

function deriveFromText(text: string, options: readonly ArchiveTaxonomyOption[]) {
  return options
    .filter((item) => matchesOption(text, item))
    .map((item) => item.label);
}

function getLookText(collection: ArchiveCollectionLike) {
  const looks = Array.isArray(collection.looks) ? collection.looks : [];
  return looks
    .map((look) => {
      const item = look as Record<string, unknown>;
      return [
        item.description,
        ...(Array.isArray(item.tags) ? item.tags : []),
        ...(Array.isArray(item.materials) ? item.materials : []),
      ]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
}

export function deriveArchiveValues(collection: ArchiveCollectionLike): ArchiveValues {
  const text = normalize(
    [collection.title, collection.slug, collection.description, getLookText(collection)]
      .filter(Boolean)
      .join(" "),
  );

  return {
    categories: mergeArchiveValues(
      collection.categories,
      deriveFromText(text, ARCHIVE_CATEGORY_OPTIONS),
    ),
    materials: mergeArchiveValues(
      collection.materials,
      deriveFromText(text, ARCHIVE_MATERIAL_OPTIONS),
    ),
    colors: mergeArchiveValues(
      collection.colors,
      deriveFromText(text, ARCHIVE_COLOR_OPTIONS),
    ),
    occasions: mergeArchiveValues(
      collection.occasions,
      deriveFromText(text, ARCHIVE_OCCASION_OPTIONS),
    ),
  };
}

export const getArchiveOptionLabels = (
  options: readonly ArchiveTaxonomyOption[],
) => options.map((item) => item.label);

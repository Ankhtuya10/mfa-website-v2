export const ASSET_FOLDERS = {
  background: "background",
  editorial: "editorial",
  collection: "collection",
  designer: "designer",
  general: "general",
} as const;

export type AssetFolder = (typeof ASSET_FOLDERS)[keyof typeof ASSET_FOLDERS];

export const ASSET_FOLDER_OPTIONS: Array<{
  value: AssetFolder;
  label: string;
  description: string;
}> = [
  {
    value: ASSET_FOLDERS.background,
    label: "Background",
    description: "Homepage/about/editorial background images and videos",
  },
  {
    value: ASSET_FOLDERS.editorial,
    label: "Editorial",
    description: "Article and editorial cover media",
  },
  {
    value: ASSET_FOLDERS.collection,
    label: "Collection",
    description: "Collection covers and look media",
  },
  {
    value: ASSET_FOLDERS.designer,
    label: "Designer",
    description: "Brand/designer profile and cover media",
  },
  {
    value: ASSET_FOLDERS.general,
    label: "General",
    description: "Uncategorized media library uploads",
  },
];

const LEGACY_FOLDER_ALIASES: Record<string, AssetFolder> = {
  assets: ASSET_FOLDERS.general,
  usage: ASSET_FOLDERS.background,
  articles: ASSET_FOLDERS.editorial,
  collections: ASSET_FOLDERS.collection,
  designers: ASSET_FOLDERS.designer,
};

const VALID_FOLDERS = new Set<AssetFolder>(
  ASSET_FOLDER_OPTIONS.map((option) => option.value),
);

export function normalizeAssetFolder(value: unknown): AssetFolder {
  if (typeof value !== "string") return ASSET_FOLDERS.general;

  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  if (!normalized) return ASSET_FOLDERS.general;
  if (normalized in LEGACY_FOLDER_ALIASES) {
    return LEGACY_FOLDER_ALIASES[normalized];
  }
  if (VALID_FOLDERS.has(normalized as AssetFolder)) {
    return normalized as AssetFolder;
  }
  return ASSET_FOLDERS.general;
}

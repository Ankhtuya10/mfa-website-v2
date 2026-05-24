const articleCategoryLabels: Record<string, string> = {
  features: "Онцлох",
  interviews: "Ярилцлага",
  news: "Мэдээ",
  trends: "Чиг хандлага",
};

const seasonLabels: Record<string, string> = {
  ss: "Хавар/Зун",
  fw: "Намар/Өвөл",
  "pre-fall": "Намрын өмнөх",
  prefall: "Намрын өмнөх",
  resort: "Амралтын улирал",
  cruise: "Амралтын улирал",
};

export function getArticleCategoryLabel(category?: string) {
  const key = String(category || "").toLowerCase();
  return articleCategoryLabels[key] || category || "Онцлох";
}

export function getSeasonLabel(season?: string) {
  const value = String(season || "").trim();
  const key = value.toLowerCase();
  return seasonLabels[key] || value;
}

export function formatSeasonYear(season?: string, year?: string | number) {
  return [getSeasonLabel(season), year].filter(Boolean).join(" ");
}

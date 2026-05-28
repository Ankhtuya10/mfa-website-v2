const pad = (value: number) => String(value).padStart(2, "0");

export function toDateTimeLocalValue(date: Date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function normalizeDateTimeLocalValue(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return toDateTimeLocalValue(date);
}

export function dateTimeLocalToIso(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

export function getCalendarScheduleDate(currentDate: Date, today = new Date()) {
  const date =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth()
      ? new Date(today)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  date.setHours(9, 0, 0, 0);
  return date;
}

export function buildScheduleArticleHref(date: Date) {
  const params = new URLSearchParams({
    status: "review",
    published_at: toDateTimeLocalValue(date),
  });

  return `/admin/articles/new?${params.toString()}`;
}

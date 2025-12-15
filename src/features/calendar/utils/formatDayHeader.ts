export const formatDayHeader = (date: Date, locale: string) => {
  const weekday = date.toLocaleDateString(locale, { weekday: "long" });
  const full = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });
  return `${weekday} · ${full}`;
};

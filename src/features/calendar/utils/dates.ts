export const toDayKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const startOfMonthIso = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  const local = new Date(date.getFullYear(), date.getMonth(), 1);
  return `${toDayKey(local)}T00:00:00`;
};

export interface CalendarDay {
  key: string;
  date: Date;
  hasActivity: boolean;
  hasPlanned: boolean;
  hasOfficial: boolean;
}

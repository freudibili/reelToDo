export const toDayKey = (date: Date): string => date.toISOString().split("T")[0];

export const startOfMonthIso = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

export interface CalendarDay {
  key: string;
  date: Date;
  hasActivity: boolean;
}

import { openai } from "./deps.ts";
import { categoriesRequiringDate } from "./normalize.ts";

type Params = {
  text: string;
  localeHint?: "de" | "fr" | "en";
  venue?: string | null;
  city?: string | null;
  artists?: string[];
};

type Result = {
  dates: string[];
  main_date: string | null;
  is_upcoming: boolean | null;
  date_confidence: number;
  date_method: "explicit-text" | "openai-web-search";
};

const toIsoDate = (year: number, month: number, day: number): string | null => {
  if (!year || !month || !day) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const uniqueSorted = (dates: string[]): string[] => {
  return Array.from(new Set(dates)).sort();
};

const todayIso = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${y}-${pad(m)}-${pad(d)}`;
};

const classifyMain = (dates: string[]) => {
  if (!dates.length) {
    return { main: null as string | null, upcoming: null as boolean | null };
  }

  const today = todayIso();
  const upcoming = dates.find((d) => d >= today);
  if (upcoming) {
    return { main: upcoming, upcoming: true };
  }
  return { main: dates[dates.length - 1], upcoming: false };
};

const monthNames: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const normalizeMonthToken = (token: string): string => {
  return token
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const parseNumericDates = (text: string): string[] => {
  const candidates: string[] = [];
  const cleaned = text.replace(/\s+/g, " ");

  // dd.mm.yyyy or dd/mm/yyyy or dd-mm-yyyy
  const reDMY = /\b(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{2,4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = reDMY.exec(cleaned))) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    const iso = toIsoDate(y, mo, d);
    if (iso) candidates.push(iso);
  }

  // yyyy-mm-dd or yyyy.mm.dd
  const reYMD = /\b(\d{4})[\.\/-](\d{1,2})[\.\/-](\d{1,2})\b/g;
  while ((m = reYMD.exec(cleaned))) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    const iso = toIsoDate(y, mo, d);
    if (iso) candidates.push(iso);
  }

  return candidates;
};

const parseMonthNameDates = (text: string): string[] => {
  const candidates: string[] = [];
  const cleaned = text.replace(/,/g, " ");
  // e.g. "15 July 2023", "15 Jul 2023"
  const re = /\b(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{2,4})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned))) {
    const d = parseInt(m[1], 10);
    const rawMonth = m[2];
    let y = parseInt(m[3], 10);
    if (y < 100) y += 2000;
    const norm = normalizeMonthToken(rawMonth);
    const mo = monthNames[norm];
    if (!mo) continue;
    const iso = toIsoDate(y, mo, d);
    if (iso) candidates.push(iso);
  }
  return candidates;
};

const parseExplicitDatesFromText = (text: string): string[] => {
  if (!text) return [];
  const numeric = parseNumericDates(text);
  const monthName = parseMonthNameDates(text);
  return uniqueSorted([...numeric, ...monthName]);
};

const buildWebSearchQuery = (params: Params): string => {
  const parts: string[] = [];
  if (params.artists && params.artists.length > 0) {
    parts.push(params.artists.join(" "));
  }
  if (params.venue) parts.push(params.venue);
  if (params.city) parts.push(params.city);
  const trimmed = params.text.trim().slice(0, 120);
  if (trimmed) parts.push(trimmed);
  return parts.join(" ");
};

const findDateViaWeb = async (params: Params): Promise<string | null> => {
  const query = buildWebSearchQuery(params);
  if (!query) return null;

  const prompt = [
    "You are a precise event date extraction engine.",
    "Search the web (concert / festival / event / ticket sites, etc.) and determine the main event date for the following query:",
    "",
    query,
    "",
    "Respond with ONLY the date in the format YYYY-MM-DD.",
    "If you cannot determine a confident single date, respond with the word null.",
  ].join("\n");

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  });

  const raw = (response as any).output_text?.trim?.() ?? "";
  if (!raw) return null;

  if (raw === "null" || raw === '"null"' || /(^|\s)null(\s|$)/i.test(raw)) {
    return null;
  }

  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return null;
  return match[0];
};

export const resolveDatesFromText = async (
  params: Params
): Promise<Result | null> => {
  // 1) explicit dates in text
  const explicitDates = parseExplicitDatesFromText(params.text);
  if (explicitDates.length > 0) {
    const { main, upcoming } = classifyMain(explicitDates);
    return {
      dates: explicitDates,
      main_date: main,
      is_upcoming: upcoming,
      date_confidence: 0.9,
      date_method: "explicit-text",
    };
  }

  // 2) web search fallback – only if we have some context
  if (!params.venue && (!params.artists || params.artists.length === 0)) {
    return null;
  }

  try {
    const webDate = await findDateViaWeb(params);
    if (!webDate) return null;
    const dates = [webDate];
    const { main, upcoming } = classifyMain(dates);
    return {
      dates,
      main_date: main,
      is_upcoming: upcoming,
      date_confidence: 0.8,
      date_method: "openai-web-search",
    };
  } catch (err) {
    console.log("[datesResolver] web search error", err);
    return null;
  }
};

export const categoryNeedsDate = (category: string | null | undefined) => {
  if (!category) return false;
  return categoriesRequiringDate.has(
    category as typeof categoriesRequiringDate extends Set<infer T> ? T : never
  );
};

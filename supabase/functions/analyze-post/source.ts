import { youtubeApiKey } from "./deps.ts";

export type SourceType =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "generic";

export interface SourceMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  author: string | null;
  publishedAt: string | null;
  source: SourceType;
}

export const detectSource = (url: string): SourceType => {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("facebook.com")) return "facebook";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "youtube";
  return "generic";
};

const decodeHtml = (value: string | null | undefined): string | null => {
  if (!value) return null;
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

const extractMetaFromHtml = (html: string) => {
  const get = (regex: RegExp) => {
    const m = html.match(regex);
    return m?.[1] ?? null;
  };
  const title =
    get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  const description =
    get(
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i
    ) ||
    get(
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i
    );
  const image =
    get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    get(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  return {
    title: decodeHtml(title),
    description: decodeHtml(description),
    image: decodeHtml(image),
  };
};

const fetchHtmlMeta = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log("[source] html fetch failed", url, res.status);
      return { title: null, description: null, image: null };
    }
    const html = await res.text();
    const extracted = extractMetaFromHtml(html);
    console.log("[source] html meta extracted", extracted);
    return extracted;
  } catch (e) {
    console.log("[source] html fetch error", String(e));
    return { title: null, description: null, image: null };
  }
};

const extractYouTubeVideoId = (url: string): string | null => {
  const u = new URL(url);
  if (u.hostname.includes("youtu.be")) {
    return u.pathname.replace("/", "") || null;
  }
  if (u.searchParams.get("v")) {
    return u.searchParams.get("v");
  }
  if (u.pathname.startsWith("/shorts/")) {
    return u.pathname.split("/")[2] ?? null;
  }
  return null;
};

const fetchYouTubeMetadata = async (
  url: string
): Promise<Omit<SourceMetadata, "source">> => {
  const videoId = extractYouTubeVideoId(url);
  console.log("[youtube] videoId", videoId);
  console.log("[youtube] api key present", Boolean(youtubeApiKey));
  if (!videoId || !youtubeApiKey) {
    const basic = await fetchHtmlMeta(url);
    return {
      title: basic.title,
      description: basic.description,
      image: basic.image,
      author: null,
      publishedAt: null,
    };
  }

  const apiUrl =
    "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" +
    videoId +
    "&key=" +
    youtubeApiKey;

  try {
    const res = await fetch(apiUrl);
    console.log("[youtube] api status", res.status);
    if (!res.ok) {
      const basic = await fetchHtmlMeta(url);
      return {
        title: basic.title,
        description: basic.description,
        image: basic.image,
        author: null,
        publishedAt: null,
      };
    }
    const json = await res.json();
    console.log("[youtube] api payload", json);
    const item = json.items?.[0];
    if (!item) {
      const basic = await fetchHtmlMeta(url);
      return {
        title: basic.title,
        description: basic.description,
        image: basic.image,
        author: null,
        publishedAt: null,
      };
    }
    const snippet = item.snippet ?? {};
    const thumbnails = snippet.thumbnails ?? {};
    const img =
      thumbnails.maxres?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url ||
      null;
    return {
      title: snippet.title ?? null,
      description: snippet.description ?? null,
      image: img,
      author: snippet.channelTitle ?? null,
      publishedAt: snippet.publishedAt ?? null,
    };
  } catch (e) {
    console.log("[youtube] api error", String(e));
    const basic = await fetchHtmlMeta(url);
    return {
      title: basic.title,
      description: basic.description,
      image: basic.image,
      author: null,
      publishedAt: null,
    };
  }
};

export const getSourceMetadata = async (
  url: string,
  userMeta?: Record<string, any>
): Promise<SourceMetadata> => {
  const source = detectSource(url);
  console.log("[source] detected", source, "for", url);
  if (source === "youtube") {
    const yt = await fetchYouTubeMetadata(url);
    const out: SourceMetadata = {
      source,
      title: userMeta?.title ?? yt.title,
      description: userMeta?.description ?? yt.description,
      image: userMeta?.thumbnail_url ?? yt.image,
      author: userMeta?.author_name ?? yt.author,
      publishedAt: yt.publishedAt,
    };
    console.log("[source] final youtube meta", out);
    return out;
  }

  const basic = await fetchHtmlMeta(url);
  const out: SourceMetadata = {
    source,
    title: userMeta?.title ?? basic.title,
    description: userMeta?.description ?? basic.description,
    image: userMeta?.thumbnail_url ?? basic.image,
    author: userMeta?.author_name ?? null,
    publishedAt: null,
  };
  console.log("[source] final meta", out);
  return out;
};

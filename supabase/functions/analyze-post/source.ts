import { normalizeActivityUrl } from "./normalize.ts";
import { facebookAppToken, youtubeApiKey } from "./deps.ts";

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
  video: string | null;
  author: string | null;
  publishedAt: string | null;
  source: SourceType;
}

export const detectSource = (url: string): SourceType => {
  const lower = url.toLowerCase();
  if (lower.includes("instagram.com")) return "instagram";
  if (
    lower.includes("facebook.com") ||
    lower.includes("fb.watch") ||
    lower.includes("fb.com") ||
    lower.includes("fb.me")
  ) {
    return "facebook";
  }
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "youtube";
  return "generic";
};

export const fetchWithUA = async (url: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers ?? {});
  headers.set(
    "User-Agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15"
  );

  const res = await fetch(url, {
    ...init,
    headers,
  });
  return res;
};

const resolveFacebookRedirect = async (url: string): Promise<string> => {
  const tryResolve = async (method: "HEAD" | "GET") => {
    try {
      const res = await fetchWithUA(url, { method, redirect: "follow" });
      const finalUrl = res.url || url;
      if (res.redirected && finalUrl !== url) {
        console.log("[source] facebook redirect", url, "->", finalUrl);
      }
      try {
        res.body?.cancel();
      } catch {
        // ignore cancellation errors
      }
      return finalUrl;
    } catch (e) {
      console.log(`[source] facebook ${method.toLowerCase()} resolve error`, String(e));
      return null;
    }
  };

  const headResolved = await tryResolve("HEAD");
  if (headResolved && headResolved !== url) return headResolved;

  const getResolved = await tryResolve("GET");
  return getResolved ?? headResolved ?? url;
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
  const video =
    get(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i) ||
    get(
      /<meta[^>]+property=["']og:video:url["'][^>]+content=["']([^"']+)["']/i
    ) ||
    get(
      /<meta[^>]+property=["']og:video:secure_url["'][^>]+content=["']([^"']+)["']/i
    ) ||
    get(
      /<meta[^>]+name=["']twitter:player:stream["'][^>]+content=["']([^"']+)["']/i
    );

  return {
    title: decodeHtml(title),
    description: decodeHtml(description),
    image: decodeHtml(image),
    video: decodeHtml(video),
  };
};

const fetchHtmlMeta = async (url: string) => {
  try {
    const res = await fetchWithUA(url);
    if (!res.ok) {
      console.log("[source] html fetch failed", url, res.status);
      return { title: null, description: null, image: null, video: null };
    }
    const html = await res.text();
    const extracted = extractMetaFromHtml(html);
    console.log("[source] html meta extracted", extracted);
    return extracted;
  } catch (e) {
    console.log("[source] html fetch error", String(e));
    return { title: null, description: null, image: null, video: null };
  }
};

const fetchOEmbed = async (
  url: string,
  source: SourceType,
  facebookToken?: string | null
): Promise<{ title: string | null; author: string | null; image: string | null } | null> => {
  let endpoint: string | null = null;
  if (source === "instagram") {
    endpoint = `https://www.instagram.com/oembed?url=${encodeURIComponent(url)}`;
  } else if (source === "facebook") {
    const base = `https://www.facebook.com/plugins/post/oembed.json/?url=${encodeURIComponent(url)}`;
    endpoint = facebookToken ? `${base}&access_token=${facebookToken}` : base;
  } else if (source === "tiktok") {
    endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
  }

  if (!endpoint) return null;

  try {
    const res = await fetchWithUA(endpoint);
    if (!res.ok) {
      console.log("[source] oembed failed", source, res.status);
      return null;
    }
    const json = await res.json();
    return {
      title: decodeHtml(json.title) ?? null,
      author: json.author_name ?? null,
      image: json.thumbnail_url ?? null,
    };
  } catch (e) {
    console.log("[source] oembed error", source, String(e));
    return null;
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

const buildYouTubeImageCandidates = (videoId: string): string[] => [
  `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${videoId}/hq720.jpg`,
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
];

const fetchYouTubeMetadata = async (
  url: string
): Promise<Omit<SourceMetadata, "source">> => {
  const videoId = extractYouTubeVideoId(url);
  console.log("[youtube] videoId", videoId);
  console.log("[youtube] api key present", Boolean(youtubeApiKey));
  const fallbackImage = videoId
    ? buildYouTubeImageCandidates(videoId)[0]
    : null;

  if (!videoId || !youtubeApiKey) {
    const basic = await fetchHtmlMeta(url);
    return {
      title: basic.title,
      description: basic.description,
      image: fallbackImage ?? basic.image,
      video: null,
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
        video: null,
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
        video: null,
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
      fallbackImage ||
      null;
    return {
      title: snippet.title ?? null,
      description: snippet.description ?? null,
      image: img,
      author: snippet.channelTitle ?? null,
      publishedAt: snippet.publishedAt ?? null,
      video: null,
    };
  } catch (e) {
    console.log("[youtube] api error", String(e));
    const basic = await fetchHtmlMeta(url);
    return {
      title: basic.title,
      description: basic.description,
      image: fallbackImage ?? basic.image,
      video: null,
      author: null,
      publishedAt: null,
    };
  }
};

const sanitizeMeta = (
  url: string,
  meta: Omit<SourceMetadata, "source">
): Omit<SourceMetadata, "source"> => {
  const normalizedUrl = normalizeActivityUrl(url).toLowerCase();
  const stripTrailingSlash = (v: string) => v.replace(/\/+$/, "");
  const targets = new Set([
    normalizedUrl,
    stripTrailingSlash(normalizedUrl),
    url.toLowerCase(),
    stripTrailingSlash(url.toLowerCase()),
  ]);
  const isUrlValue = (v: string | null | undefined) =>
    typeof v === "string" && v.trim().length > 0 && targets.has(stripTrailingSlash(v.trim().toLowerCase()));

  return {
    title: isUrlValue(meta.title) ? null : meta.title,
    description: isUrlValue(meta.description) ? null : meta.description,
    image: meta.image,
    video: meta.video ?? null,
    author: meta.author,
    publishedAt: meta.publishedAt ?? null,
  };
};

export const getSourceMetadata = async (
  url: string,
  userMeta?: Record<string, any>
): Promise<SourceMetadata> => {
  const source = detectSource(url);
  console.log("[source] detected", source, "for", url);
  const targetUrl =
    source === "facebook" ? normalizeActivityUrl(await resolveFacebookRedirect(url)) : url;
  if (targetUrl !== url) {
    console.log("[source] resolved url for metadata", targetUrl);
  }

  const pickUserMeta = () => ({
    title: userMeta?.title ?? null,
    description: userMeta?.description ?? null,
    image: userMeta?.thumbnail_url ?? null,
    video: userMeta?.video_url ?? userMeta?.video ?? null,
    author: userMeta?.author_name ?? null,
  });
  const mergeWithHtml = async (
    current: {
      title: string | null;
      description: string | null;
      image: string | null;
      video: string | null;
      author: string | null;
    }
  ) => {
    if (current.title && current.description && current.image && current.video) return current;
    const html = await fetchHtmlMeta(targetUrl);
    return {
      title: current.title ?? html.title,
      description: current.description ?? html.description,
      image: current.image ?? html.image,
      video: current.video ?? html.video,
      author: current.author ?? null,
    };
  };

  if (source === "youtube") {
    const yt = await fetchYouTubeMetadata(targetUrl);
    const out: SourceMetadata = sanitizeMeta(targetUrl, {
      source,
      title: userMeta?.title ?? yt.title,
      description: userMeta?.description ?? yt.description,
      image: userMeta?.thumbnail_url ?? yt.image,
      video: userMeta?.video_url ?? userMeta?.video ?? yt.video ?? null,
      author: userMeta?.author_name ?? yt.author,
      publishedAt: yt.publishedAt,
    }) as SourceMetadata;
    console.log("[source] final youtube meta", out);
    return out;
  }

  const userFirst = pickUserMeta();
  const oembed =
    source === "facebook" && !facebookAppToken
      ? null
      : await fetchOEmbed(targetUrl, source, facebookAppToken);
  if (source === "facebook" && userMeta) {
    const merged = await mergeWithHtml({
      title: userFirst.title ?? oembed?.title ?? null,
      description: userFirst.description ?? null,
      image: userFirst.image ?? oembed?.image ?? null,
      video: userFirst.video ?? null,
      author: userFirst.author ?? oembed?.author ?? null,
    });
    const out: SourceMetadata = { source, ...sanitizeMeta(targetUrl, merged), publishedAt: null };
    console.log("[source] final facebook meta", out);
    return out;
  }

  if (oembed) {
    const merged = await mergeWithHtml({
      title: userFirst.title ?? oembed.title,
      description: userFirst.description ?? null,
      image: userFirst.image ?? oembed.image,
      video: userFirst.video ?? null,
      author: userFirst.author ?? oembed.author,
    });
    const out: SourceMetadata = { source, ...sanitizeMeta(targetUrl, merged), publishedAt: null };
    console.log("[source] final oembed meta", out);
    return out;
  }

  const basic = await fetchHtmlMeta(targetUrl);
  const out: SourceMetadata = sanitizeMeta(targetUrl, {
    source,
    title: userFirst.title ?? basic.title,
    description: userFirst.description ?? basic.description,
    image: userFirst.image ?? basic.image,
    video: userFirst.video ?? basic.video ?? null,
    author: userFirst.author ?? null,
    publishedAt: null,
  }) as SourceMetadata;
  console.log("[source] final meta", out);
  return out;
};

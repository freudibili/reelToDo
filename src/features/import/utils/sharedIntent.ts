import type { ShareIntent } from "expo-share-intent";

import type { ParsedSharedIntent } from "../types";

export const isValidHttpUrl = (input: string) => {
  if (!input) return false;
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const tryParseShareIntent = (raw: string): ShareIntent | null => {
  try {
    return JSON.parse(raw) as ShareIntent;
  } catch {
    return null;
  }
};

const extractUrlFromText = (text?: string | null) => {
  if (!text) return null;
  const match = text.match(/https?:\/\/\S+/i);
  if (match && isValidHttpUrl(match[0])) {
    return match[0];
  }
  return null;
};

const extractSharedUrl = (data: ShareIntent | null) => {
  const candidate = data?.webUrl;
  if (candidate && isValidHttpUrl(candidate)) return candidate;
  return extractUrlFromText(data?.text);
};

export const parseSharedIntent = (
  sharedParam: string | string[] | undefined
): ParsedSharedIntent => {
  if (!sharedParam || Array.isArray(sharedParam)) {
    return {
      raw: null,
      data: null,
      sharedUrl: null,
    };
  }

  const decoded =
    (() => {
      try {
        return decodeURIComponent(sharedParam);
      } catch {
        return sharedParam;
      }
    })() ?? sharedParam;

  const data =
    tryParseShareIntent(sharedParam) ||
    (decoded ? tryParseShareIntent(decoded) : null) ||
    null;

  return {
    raw: sharedParam,
    data,
    sharedUrl: extractSharedUrl(data),
  };
};

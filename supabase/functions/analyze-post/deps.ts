import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY") ?? null;
const FACEBOOK_APP_TOKEN_ENV = Deno.env.get("FACEBOOK_APP_TOKEN") ?? null;
const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID") ?? null;
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET") ?? null;
const MEDIA_ANALYZER_URL = Deno.env.get("MEDIA_ANALYZER_URL") ?? null;
const MEDIA_ANALYZER_API_TOKEN =
  Deno.env.get("MEDIA_ANALYZER_API_TOKEN") ?? null;
const FACEBOOK_APP_TOKEN =
  FACEBOOK_APP_TOKEN_ENV ??
  (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET
    ? `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
    : null);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing environment variables for Supabase");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
export const youtubeApiKey = YOUTUBE_API_KEY;
export const facebookAppToken = FACEBOOK_APP_TOKEN;
export const mediaAnalyzerUrl = MEDIA_ANALYZER_URL;
export const mediaAnalyzerApiToken = MEDIA_ANALYZER_API_TOKEN;

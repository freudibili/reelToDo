import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

let SUPABASE_URL: string | undefined;
let SUPABASE_ANON_KEY: string | undefined;

try {
  const Constants = require("expo-constants").default;
  SUPABASE_URL =
    Constants?.expoConfig?.extra?.SUPABASE_URL || process?.env?.SUPABASE_URL;
  SUPABASE_ANON_KEY =
    Constants?.expoConfig?.extra?.SUPABASE_ANON_KEY ||
    process?.env?.SUPABASE_ANON_KEY;
} catch {
  SUPABASE_URL = process?.env?.SUPABASE_URL;
  SUPABASE_ANON_KEY = process?.env?.SUPABASE_ANON_KEY;
}

export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
  auth: {
    persistSession: true,
    storage: AsyncStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: { params: { eventsPerSecond: 10 } },
});

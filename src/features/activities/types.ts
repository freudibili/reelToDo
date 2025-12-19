export type MediaAnalyzerLocation = {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export interface Activity {
  id: string;
  user_id: string | null;
  planned_at?: string | null;
  activity_date_id?: string | null;
  calendar_event_id?: string | null;
  is_favorite?: boolean;
  favorited_at?: string | null;
  title: string | null;
  category: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  dates?: string[] | null;
  main_date?: string | null;
  tags: string[];
  creator: string | null;
  source_url: string | null;
  source?: string | null;
  image_url: string | null;
  confidence: number | null;
  created_at: string;
  processing_status?: ActivityProcessingStatus | null;
  processing_step?: string | null;
  processing_error?: string | null;
  distance?: number | null;
  location_status?: "confirmed" | "suggested" | "unconfirmed" | "missing";
  location_confirmed_at?: string | null;
  location_confirmed_by?: string | null;
  needs_location_confirmation: boolean;
  needs_date_confirmation: boolean;
  locations?: MediaAnalyzerLocation[] | null;
  analyzer_locations?: MediaAnalyzerLocation[] | null;
}

export type ActivityCategory =
  | "food_drinks"
  | "nature_outdoors"
  | "culture_attractions"
  | "events_entertainment"
  | "family_kids"
  | "sports_adventure"
  | "wellness_relax"
  | "nightlife_social"
  | "shopping_markets"
  | "travel_practical";

export type ActivityProcessingStatus = "processing" | "complete" | "failed";

export type ActivityModeDate = "update" | "suggest";

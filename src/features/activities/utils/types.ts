export interface Activity {
  id: string;
  user_id: string | null;
  planned_at?: string | null;
  activity_date_id?: string | null;
  calendar_event_id?: string | null;
  is_favorite?: boolean;
  title: string | null;
  category: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  main_date: string | null;
  tags: string[];
  creator: string | null;
  source_url: string | null;
  image_url: string | null;
  confidence: number | null;
  created_at: string;
  distance?: number | null;
  needs_location_confirmation: boolean;
  needs_date_confirmation: boolean;
}

export type ActivityCategory =
  | "outdoor-hike"
  | "outdoor-nature-spot"
  | "outdoor-beach"
  | "outdoor-park"
  | "outdoor-viewpoint"
  | "food-cafe"
  | "food-restaurant"
  | "food-bar"
  | "food-street-food"
  | "event-market"
  | "event-festival"
  | "event-concert"
  | "event-exhibition"
  | "culture-museum"
  | "culture-monument"
  | "culture-architecture"
  | "workshop-cooking"
  | "workshop-art"
  | "workshop-wellness"
  | "nightlife-club"
  | "nightlife-bar"
  | "shopping-local"
  | "shopping-vintage";

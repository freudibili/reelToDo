export interface Activity {
  id: string;
  user_id: string | null;
  title: string | null;
  category: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  main_date: string | null;
  tags: string[];
  creator: string | null;
  source_url: string | null;
  image_url: string | null;
  confidence: number | null;
  created_at: string;
}

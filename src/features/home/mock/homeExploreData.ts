export type BudgetLevel = "€" | "€€" | "€€€";

export type CategoryTag =
  | "highlights"
  | "walks"
  | "hikes"
  | "museums"
  | "food"
  | "cafes"
  | "bars"
  | "markets"
  | "nightlife"
  | "family"
  | "design";

export type Itinerary = {
  id: string;
  title: string;
  description: string;
  days: number;
  stops: string[];
  tags: CategoryTag[];
  mapsUrl?: string;
  mapImageUrl?: string;
  directions?: {
    distanceText?: string;
    durationText?: string;
    url?: string;
  };
};

export type EatSpot = {
  id: string;
  name: string;
  category: string;
  budget: BudgetLevel;
  description: string;
  distance: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
};

export type SleepSpot = {
  id: string;
  name: string;
  type: string;
  priceRange: string;
  description: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
  distance?: string;
};

export type EventSpot = {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
};

export type PoiSpot = {
  id: string;
  name: string;
  category: string;
  description: string;
  distance: string;
  tags: CategoryTag[];
  photoUrl?: string;
  mapsUrl?: string;
};

export type PackingItem = {
  id: string;
  label: string;
  detail?: string;
  tags?: CategoryTag[];
};

export type HomeExploreData = {
  location?: string;
  itineraries: Itinerary[];
  eats: EatSpot[];
  sleeps: SleepSpot[];
  events: EventSpot[];
  points: PoiSpot[];
  packing: PackingItem[];
};

export const homeExploreData: HomeExploreData = {
  location: "Vienna, Austria",
  itineraries: [
    {
      id: "vienna-classic",
      title: "3 days in Vienna — Classic highlights",
      description:
        "Old Town icons, royal palaces, and cozy coffeehouse afternoons.",
      days: 3,
      stops: [
        "Day 1: St. Stephen's, Graben, Ring Tram loop",
        "Day 2: Schönbrunn + gardens, Naschmarkt bites",
        "Day 3: MuseumsQuartier, Belvedere sunset",
      ],
      tags: ["highlights", "walks", "museums", "food", "cafes"],
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&origin=St.+Stephen%27s+Cathedral,+Vienna&destination=Belvedere+Palace,+Vienna&waypoints=Naschmarkt,+Vienna|MuseumsQuartier,+Vienna",
      mapImageUrl:
        "https://maps.googleapis.com/maps/api/staticmap?size=800x400&markers=color:green|label:1|48.2082,16.3738&markers=color:red|label:2|48.1952,16.3612&markers=color:red|label:3|48.2033,16.3619&markers=color:red|label:4|48.1919,16.3805",
      directions: {
        distanceText: "14 km",
        durationText: "1h 05m",
      },
    },
    {
      id: "vienna-green",
      title: "2 days — Green Vienna",
      description: "Parks, Danube views, and light hikes close to the city.",
      days: 2,
      stops: [
        "Day 1: Prater morning ride, Donaukanal art walk",
        "Day 2: Kahlenberg woods, Heuriger dinner",
      ],
      tags: ["hikes", "walks", "food", "markets", "family"],
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&origin=Prater,+Vienna&destination=Kahlenberg,+Vienna&waypoints=Donaukanal,+Vienna|Grinzing,+Vienna",
      mapImageUrl:
        "https://maps.googleapis.com/maps/api/staticmap?size=800x400&markers=color:green|label:1|48.2167,16.4000&markers=color:red|label:2|48.2350,16.3760&markers=color:red|label:3|48.2590,16.3297",
      directions: {
        distanceText: "18 km",
        durationText: "1h 20m",
      },
    },
    {
      id: "vienna-at-night",
      title: "48h — Vienna after dark",
      description: "Evening museums, wine bars, and late cafés.",
      days: 2,
      stops: [
        "Day 1: Leopold Museum late, Neubau wine bars",
        "Day 2: Danube sunset, rooftop drinks, jazz cellar",
      ],
      tags: ["nightlife", "bars", "cafes", "design"],
      mapsUrl:
        "https://www.google.com/maps/dir/?api=1&origin=Leopold+Museum,+Vienna&destination=Donaukanal,+Vienna&waypoints=Neubau,+Vienna|Skyline+Rooftop+Bar,+Vienna|Jazzland,+Vienna",
      mapImageUrl:
        "https://maps.googleapis.com/maps/api/staticmap?size=800x400&markers=color:green|label:1|48.2038,16.3595&markers=color:red|label:2|48.1990,16.3460&markers=color:red|label:3|48.2110,16.3790&markers=color:red|label:4|48.2138,16.3755",
      directions: {
        distanceText: "7 km",
        durationText: "45m",
      },
    },
  ],
  eats: [
    {
      id: "naschmarkt-brunch",
      name: "Naschmarkt Brunch Table",
      category: "Market bites / Brunch",
      budget: "€€",
      description: "Local produce, mezze plates, and early coffee.",
      distance: "900 m",
      tags: ["food", "markets", "cafes", "family"],
      photoUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Naschmarkt/",
    },
    {
      id: "kaffeehaus",
      name: "Altstadt Kaffeehaus",
      category: "Coffee / Dessert",
      budget: "€",
      description: "Marble tables, melange, and Sachertorte break.",
      distance: "1.1 km",
      tags: ["cafes", "design", "food"],
      photoUrl:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Cafe+Sperl/",
    },
    {
      id: "heuriger",
      name: "Grinzing Heuriger",
      category: "Traditional tavern",
      budget: "€€",
      description: "Courtyard seating, new wine, hearty sharing plates.",
      distance: "6.4 km",
      tags: ["food", "family", "nightlife"],
      photoUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Grinzing/",
    },
    {
      id: "chef-counter",
      name: "Kanal Chef's Counter",
      category: "Modern restaurant",
      budget: "€€€",
      description: "Seasonal tasting with riverfront views.",
      distance: "2.2 km",
      tags: ["food", "design", "nightlife"],
      photoUrl:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Steirereck/",
    },
    {
      id: "rooftop-sunset",
      name: "Skyline Rooftop Bar",
      category: "Cocktails / Small plates",
      budget: "€€€",
      description: "Golden-hour spritz with skyline panorama.",
      distance: "1.4 km",
      tags: ["bars", "nightlife", "design"],
      photoUrl:
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Dachboden+Loft+Bar/",
    },
  ],
  sleeps: [
    {
      id: "boutique-ring",
      name: "Boutique on the Ring",
      type: "Boutique hotel",
      priceRange: "€€€ · curated rooms near the Ring",
      description: "Design-forward suites with late checkout.",
      tags: ["design", "nightlife", "highlights"],
      photoUrl:
        "https://images.unsplash.com/photo-1501117716987-c8e1ecb210af?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Hotel+Imperial,+a+Luxury+Collection+Hotel,+Vienna/",
      distance: "500 m",
    },
    {
      id: "cozy-guesthouse",
      name: "Cozy Guesthouse Westbahn",
      type: "Guesthouse",
      priceRange: "€€ · homey, close to transit",
      description: "Quiet courtyard, shared kitchen, friendly host.",
      tags: ["family", "walks", "highlights"],
      photoUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Haydn+Hotel/",
      distance: "2.0 km",
    },
    {
      id: "green-hostel",
      name: "Danube Green Hostel",
      type: "Hostel",
      priceRange: "€ · riverfront, bike-friendly",
      description: "Bunk and private rooms with social lounge.",
      tags: ["hikes", "walks", "markets"],
      photoUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Wombat%27s+CITY+Hostel+-+Vienna+Naschmarkt/",
      distance: "1.2 km",
    },
  ],
  events: [
    {
      id: "mq-summer-stage",
      name: "MQ Summer Stage",
      category: "Open-air",
      description: "Evening concerts and art projections in MuseumsQuartier.",
      distance: "1.0 km",
      tags: ["nightlife", "design"],
      photoUrl:
        "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/MuseumsQuartier+Wien/",
    },
    {
      id: "danube-jazz",
      name: "Danube Riverside Jazz",
      category: "Live music",
      description: "Pop-up jazz set by the canal with street food.",
      distance: "1.6 km",
      tags: ["nightlife", "food"],
      photoUrl:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Donaukanal/",
    },
  ],
  points: [
    {
      id: "belvedere-gardens",
      name: "Belvedere Gardens",
      category: "Park",
      description: "Formal baroque gardens with skyline views.",
      distance: "1.5 km",
      tags: ["highlights", "walks"],
      photoUrl:
        "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Belvedere+Palace/",
    },
    {
      id: "hundertwasserhaus",
      name: "Hundertwasserhaus",
      category: "Architecture",
      description: "Colorful facade with uneven floors and trees.",
      distance: "2.2 km",
      tags: ["design", "walks"],
      photoUrl:
        "https://images.unsplash.com/photo-1529429617124-aee656307c16?auto=format&fit=crop&w=1200&q=80",
      mapsUrl: "https://www.google.com/maps/place/Hundertwasserhaus+Wien/",
    },
  ],
  packing: [
    {
      id: "walking-shoes",
      label: "Comfortable walking shoes",
      detail: "Old Town and parks are best on foot.",
      tags: ["walks", "highlights", "family"],
    },
    {
      id: "light-jacket",
      label: "Light jacket",
      detail: "Evenings by the Danube get breezy.",
      tags: ["nightlife", "walks", "hikes"],
    },
    {
      id: "camera",
      label: "Camera or phone space",
      detail: "MuseumsQuartier facades at sunset are photogenic.",
      tags: ["design", "highlights"],
    },
    {
      id: "transport-card",
      label: "Transport card",
      detail: "Trams make hopping between districts simple.",
      tags: ["highlights", "family"],
    },
    {
      id: "dinner-res",
      label: "Dinner reservations",
      detail: "Popular spots fill up on weekends.",
      tags: ["food", "nightlife"],
    },
    {
      id: "water-bottle",
      label: "Reusable water bottle",
      detail: "Fill at city fountains during walks.",
      tags: ["walks", "hikes", "family"],
    },
  ],
};

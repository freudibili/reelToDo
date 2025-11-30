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
};

export type EatSpot = {
  id: string;
  name: string;
  category: string;
  budget: BudgetLevel;
  description: string;
  distance: string;
  tags: CategoryTag[];
};

export type SleepSpot = {
  id: string;
  name: string;
  type: string;
  priceRange: string;
  description: string;
  tags: CategoryTag[];
};

export type PackingItem = {
  id: string;
  label: string;
  detail?: string;
  tags?: CategoryTag[];
};

export type HomeExploreData = {
  itineraries: Itinerary[];
  eats: EatSpot[];
  sleeps: SleepSpot[];
  packing: PackingItem[];
};

export const homeExploreData: HomeExploreData = {
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
    },
    {
      id: "kaffeehaus",
      name: "Altstadt Kaffeehaus",
      category: "Coffee / Dessert",
      budget: "€",
      description: "Marble tables, melange, and Sachertorte break.",
      distance: "1.1 km",
      tags: ["cafes", "design", "food"],
    },
    {
      id: "heuriger",
      name: "Grinzing Heuriger",
      category: "Traditional tavern",
      budget: "€€",
      description: "Courtyard seating, new wine, hearty sharing plates.",
      distance: "6.4 km",
      tags: ["food", "family", "nightlife"],
    },
    {
      id: "chef-counter",
      name: "Kanal Chef's Counter",
      category: "Modern restaurant",
      budget: "€€€",
      description: "Seasonal tasting with riverfront views.",
      distance: "2.2 km",
      tags: ["food", "design", "nightlife"],
    },
    {
      id: "rooftop-sunset",
      name: "Skyline Rooftop Bar",
      category: "Cocktails / Small plates",
      budget: "€€€",
      description: "Golden-hour spritz with skyline panorama.",
      distance: "1.4 km",
      tags: ["bars", "nightlife", "design"],
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
    },
    {
      id: "cozy-guesthouse",
      name: "Cozy Guesthouse Westbahn",
      type: "Guesthouse",
      priceRange: "€€ · homey, close to transit",
      description: "Quiet courtyard, shared kitchen, friendly host.",
      tags: ["family", "walks", "highlights"],
    },
    {
      id: "green-hostel",
      name: "Danube Green Hostel",
      type: "Hostel",
      priceRange: "€ · riverfront, bike-friendly",
      description: "Bunk and private rooms with social lounge.",
      tags: ["hikes", "walks", "markets"],
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

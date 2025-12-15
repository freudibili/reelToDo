const DEFAULT_CATEGORY_ICON = "shape-outline";

type IconRule = {
  keywords: string[];
  icon: string;
};

const KEYWORD_RULES: IconRule[] = [
  {
    keywords: ["food", "restaurant", "dining", "eat", "drink", "coffee", "brew"],
    icon: "silverware-fork-knife",
  },
  {
    keywords: ["music", "concert", "dj", "band", "song"],
    icon: "music-circle",
  },
  {
    keywords: ["festival", "party", "celebration", "event"],
    icon: "party-popper",
  },
  {
    keywords: ["art", "museum", "gallery", "craft"],
    icon: "palette",
  },
  {
    keywords: ["sport", "sports", "fitness", "run", "yoga", "athletic"],
    icon: "dumbbell",
  },
  {
    keywords: ["outdoor", "nature", "park", "hike", "hiking", "trail"],
    icon: "pine-tree",
  },
  {
    keywords: ["family", "kids", "child", "toddler", "youth"],
    icon: "human-male-child",
  },
  {
    keywords: ["community", "volunteer", "social", "networking"],
    icon: "account-group",
  },
  {
    keywords: ["education", "class", "course", "workshop", "learning"],
    icon: "school",
  },
  {
    keywords: ["history", "culture", "heritage"],
    icon: "bank",
  },
  {
    keywords: ["film", "movie", "cinema", "screen"],
    icon: "movie-open",
  },
  {
    keywords: ["nightlife", "bar", "club"],
    icon: "glass-cocktail",
  },
  {
    keywords: ["shopping", "market", "flea"],
    icon: "shopping",
  },
  {
    keywords: ["technology", "tech", "innovation", "science"],
    icon: "laptop",
  },
  {
    keywords: ["wellness", "spa", "mindfulness", "meditation"],
    icon: "spa",
  },
  {
    keywords: ["travel", "tour", "explore"],
    icon: "map-marker-distance",
  },
  {
    keywords: ["theater", "theatre", "show", "performance"],
    icon: "drama-masks",
  },
  {
    keywords: ["gaming", "game"],
    icon: "controller-classic",
  },
];

const DIRECT_MAP: Record<string, string> = {
  art: "palette",
  arts: "palette",
  artistic: "palette",
  music: "music-circle",
  concert: "music-circle",
  festivals: "party-popper",
  festival: "party-popper",
  sports: "dumbbell",
  sport: "dumbbell",
  fitness: "dumbbell",
  outdoor: "pine-tree",
  outdoors: "pine-tree",
  food: "silverware-fork-knife",
  dining: "silverware-fork-knife",
  restaurant: "silverware-fork-knife",
  nightlife: "glass-cocktail",
  drinks: "glass-cocktail",
  family: "human-male-child",
  kids: "human-male-child",
  community: "account-group",
  volunteer: "hand-heart",
  education: "school",
  workshop: "lightbulb-on",
  history: "bank",
  culture: "drama-masks",
  film: "movie-open",
  movies: "movie-open",
  shopping: "shopping",
  market: "shopping",
  wellness: "spa",
  travel: "map-marker-distance",
  adventure: "map-marker-distance",
};

const normalizeCategory = (category: string | null | undefined) =>
  category?.trim().toLowerCase() ?? "";

export const getCategoryIconName = (
  category: string | null | undefined
): string => {
  const normalized = normalizeCategory(category);
  if (!normalized) return DEFAULT_CATEGORY_ICON;

  if (DIRECT_MAP[normalized]) {
    return DIRECT_MAP[normalized];
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.icon;
    }
  }

  return DEFAULT_CATEGORY_ICON;
};

export const getAllCategoryIconName = () => "view-grid-outline";

export const categoryIcons = {
  getCategoryIconName,
  getAllCategoryIconName,
};

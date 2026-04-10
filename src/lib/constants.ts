export const SCAN_STATUSES = ["pending", "processing", "completed", "failed"] as const;
export type ScanStatus = (typeof SCAN_STATUSES)[number];

export const REVIEW_STATUSES = ["unreviewed", "confirmed", "corrected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const CONDITION_RATINGS = ["excellent", "good", "fair", "poor", "critical"] as const;
export type ConditionRating = (typeof CONDITION_RATINGS)[number];

export const FLOOR_CATEGORIES = [
  { slug: "hardwood_solid", dbSlug: "hardwood-solid", label: "Solid Hardwood" },
  { slug: "hardwood_engineered", dbSlug: "hardwood-engineered", label: "Engineered Hardwood" },
  { slug: "laminate", dbSlug: "laminate", label: "Laminate" },
  { slug: "vinyl_luxury", dbSlug: "vinyl-luxury", label: "Luxury Vinyl" },
  { slug: "vinyl_sheet", dbSlug: "vinyl-sheet", label: "Sheet Vinyl" },
  { slug: "ceramic_tile", dbSlug: "ceramic-tile", label: "Ceramic Tile" },
  { slug: "porcelain_tile", dbSlug: "porcelain-tile", label: "Porcelain Tile" },
  { slug: "natural_stone", dbSlug: "natural-stone", label: "Natural Stone" },
  { slug: "carpet", dbSlug: "carpet", label: "Carpet" },
  { slug: "concrete", dbSlug: "concrete", label: "Concrete" },
  { slug: "other", dbSlug: "other", label: "Other / Specialty" },
] as const;

export const CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  FLOOR_CATEGORIES.map((c) => [c.slug, c.label])
);

export const CATEGORY_DB_SLUG_MAP: Record<string, string> = Object.fromEntries(
  FLOOR_CATEGORIES.map((c) => [c.slug, c.dbSlug])
);

export const CATEGORY_SELECT_OPTIONS = FLOOR_CATEGORIES.map((c) => ({
  value: c.slug,
  label: c.label,
}));

export const CONDITION_SELECT_OPTIONS = CONDITION_RATINGS.map((r) => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export const CONDITION_COLORS: Record<string, string> = {
  excellent: "bg-green-100 text-green-800",
  good: "bg-blue-100 text-blue-800",
  fair: "bg-yellow-100 text-yellow-800",
  poor: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

import { db } from "@/lib/db";
import { costDefaults, costOverrides, floorTypes, floorCategories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CATEGORY_DB_SLUG_MAP } from "@/lib/constants";

// Regional labor/material multipliers relative to national average
const REGIONAL_MULTIPLIERS: Record<string, { material: number; labor: number }> = {
  national: { material: 1.0, labor: 1.0 },
  northeast: { material: 1.05, labor: 1.25 },
  southeast: { material: 0.95, labor: 0.9 },
  midwest: { material: 0.98, labor: 0.95 },
  southwest: { material: 1.0, labor: 1.05 },
  west: { material: 1.1, labor: 1.3 },
  pacific_hawaii_alaska: { material: 1.25, labor: 1.4 },
};

export interface CostEstimate {
  perSqFt: {
    materialLow: number;
    materialHigh: number;
    laborLow: number;
    laborHigh: number;
    totalLow: number;
    totalHigh: number;
  };
  removalPerSqFt: {
    low: number;
    high: number;
  } | null;
  source: "company" | "national_average";
  region: string;
}

export async function estimateCost(
  floorCategorySlug: string,
  companyId: string,
  region: string = "national"
): Promise<CostEstimate | null> {
  // Find the floor type ID from category slug
  const [category] = await db
    .select()
    .from(floorCategories)
    .where(eq(floorCategories.slug, floorCategorySlug))
    .limit(1);

  if (!category) return null;

  // Get the first floor type in this category (representative cost)
  const [type] = await db
    .select()
    .from(floorTypes)
    .where(eq(floorTypes.categoryId, category.id))
    .limit(1);

  if (!type) return null;

  const [[override], [defaults]] = await Promise.all([
    db
      .select()
      .from(costOverrides)
      .where(
        and(
          eq(costOverrides.companyId, companyId),
          eq(costOverrides.floorTypeId, type.id)
        )
      )
      .limit(1),
    db
      .select()
      .from(costDefaults)
      .where(eq(costDefaults.floorTypeId, type.id))
      .limit(1),
  ]);

  if (!defaults && !override) return null;

  const regionMult = REGIONAL_MULTIPLIERS[region] || REGIONAL_MULTIPLIERS.national;

  const materialLow = ((override?.materialLow ?? defaults?.materialLow) || 0) * regionMult.material;
  const materialHigh = ((override?.materialHigh ?? defaults?.materialHigh) || 0) * regionMult.material;
  const laborLow = ((override?.laborLow ?? defaults?.laborLow) || 0) * regionMult.labor;
  const laborHigh = ((override?.laborHigh ?? defaults?.laborHigh) || 0) * regionMult.labor;

  const removalLow = defaults?.removalLow ? defaults.removalLow * regionMult.labor : null;
  const removalHigh = defaults?.removalHigh ? defaults.removalHigh * regionMult.labor : null;

  return {
    perSqFt: {
      materialLow: round(materialLow),
      materialHigh: round(materialHigh),
      laborLow: round(laborLow),
      laborHigh: round(laborHigh),
      totalLow: round(materialLow + laborLow),
      totalHigh: round(materialHigh + laborHigh),
    },
    removalPerSqFt:
      removalLow !== null && removalHigh !== null
        ? { low: round(removalLow), high: round(removalHigh) }
        : null,
    source: override ? "company" : "national_average",
    region,
  };
}

export function aiCategoryToDbSlug(aiCategory: string): string {
  return CATEGORY_DB_SLUG_MAP[aiCategory] || aiCategory;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

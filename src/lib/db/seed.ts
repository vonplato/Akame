import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { floorCategories, floorTypes, costDefaults } from "./schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const categories = [
  { name: "Solid Hardwood", slug: "hardwood-solid", description: "Solid wood planks milled from a single piece of timber", sortOrder: 1 },
  { name: "Engineered Hardwood", slug: "hardwood-engineered", description: "Layered wood product with a hardwood veneer top", sortOrder: 2 },
  { name: "Laminate", slug: "laminate", description: "Synthetic multi-layer flooring with a photographic wood or stone layer", sortOrder: 3 },
  { name: "Luxury Vinyl", slug: "vinyl-luxury", description: "LVP and LVT — waterproof vinyl planks and tiles", sortOrder: 4 },
  { name: "Sheet Vinyl", slug: "vinyl-sheet", description: "Continuous vinyl sheets for moisture-prone areas", sortOrder: 5 },
  { name: "Ceramic Tile", slug: "ceramic-tile", description: "Fired clay tiles, glazed or unglazed", sortOrder: 6 },
  { name: "Porcelain Tile", slug: "porcelain-tile", description: "Dense, durable tile fired at higher temperatures than ceramic", sortOrder: 7 },
  { name: "Natural Stone", slug: "natural-stone", description: "Marble, granite, slate, travertine, and other quarried stone", sortOrder: 8 },
  { name: "Carpet", slug: "carpet", description: "Textile floor covering in broadloom or tile formats", sortOrder: 9 },
  { name: "Concrete", slug: "concrete", description: "Polished, stained, stamped, or epoxy-coated concrete", sortOrder: 10 },
  { name: "Other / Specialty", slug: "other", description: "Cork, linoleum, rubber, terrazzo, brick, and other specialty flooring", sortOrder: 11 },
];

// Floor types per category — keyed by category slug
const typesByCategory: Record<string, { name: string; slug: string; description: string }[]> = {
  "hardwood-solid": [
    { name: "Red Oak", slug: "red-oak", description: "Most common US hardwood, warm reddish tone" },
    { name: "White Oak", slug: "white-oak", description: "Durable, water-resistant, golden brown tone" },
    { name: "Hickory", slug: "hickory", description: "Very hard, dramatic grain variation" },
    { name: "Maple", slug: "maple", description: "Light, fine-grained, very hard" },
    { name: "Cherry", slug: "cherry", description: "Rich reddish-brown, darkens with age" },
    { name: "Walnut", slug: "walnut", description: "Dark brown, premium, softer than oak" },
    { name: "Ash", slug: "ash", description: "Light colored, prominent grain similar to oak" },
    { name: "Birch", slug: "birch", description: "Fine grain, light to medium brown" },
    { name: "Pine", slug: "pine", description: "Softwood, rustic character, dents easily" },
    { name: "Bamboo", slug: "bamboo", description: "Technically a grass, varies in hardness" },
    { name: "Brazilian Cherry (Jatoba)", slug: "brazilian-cherry", description: "Very hard exotic, deep red-orange" },
    { name: "Teak", slug: "teak", description: "Naturally water-resistant, golden brown" },
    { name: "Mahogany", slug: "mahogany", description: "Rich reddish-brown exotic hardwood" },
    { name: "Reclaimed / Antique", slug: "reclaimed", description: "Salvaged wood with aged character" },
  ],
  "hardwood-engineered": [
    { name: "Engineered Oak", slug: "engineered-oak", description: "Oak veneer over plywood core" },
    { name: "Engineered Walnut", slug: "engineered-walnut", description: "Walnut veneer, more stable than solid" },
    { name: "Engineered Maple", slug: "engineered-maple", description: "Maple veneer on engineered core" },
    { name: "Engineered Hickory", slug: "engineered-hickory", description: "Hickory veneer with high stability" },
    { name: "Wide Plank Engineered", slug: "wide-plank-engineered", description: "7+ inch wide engineered planks" },
    { name: "Herringbone Engineered", slug: "herringbone-engineered", description: "Engineered planks for herringbone pattern" },
    { name: "Hand-Scraped Engineered", slug: "hand-scraped-engineered", description: "Textured surface for rustic look" },
  ],
  "laminate": [
    { name: "Wood-Look Laminate", slug: "wood-look", description: "Photographic layer mimics hardwood grain" },
    { name: "Stone-Look Laminate", slug: "stone-look", description: "Mimics natural stone appearance" },
    { name: "Tile-Look Laminate", slug: "tile-look", description: "Mimics ceramic or porcelain tile" },
    { name: "Water-Resistant Laminate", slug: "water-resistant", description: "Enhanced moisture protection at seams" },
  ],
  "vinyl-luxury": [
    { name: "Luxury Vinyl Plank (LVP)", slug: "lvp", description: "Plank format, wood-look vinyl" },
    { name: "Luxury Vinyl Tile (LVT)", slug: "lvt", description: "Tile format, stone or ceramic look" },
    { name: "Rigid Core SPC", slug: "spc", description: "Stone Polymer Composite, very rigid and stable" },
    { name: "Rigid Core WPC", slug: "wpc", description: "Wood Polymer Composite, warmer underfoot" },
    { name: "Peel-and-Stick Vinyl", slug: "peel-stick", description: "Self-adhesive vinyl planks or tiles" },
  ],
  "vinyl-sheet": [
    { name: "Fiberglass-Backed Sheet", slug: "fiberglass-backed", description: "Standard residential sheet vinyl" },
    { name: "Felt-Backed Sheet", slug: "felt-backed", description: "Budget or older installations" },
    { name: "Cushioned Sheet Vinyl", slug: "cushioned", description: "Extra padding layer for comfort" },
  ],
  "ceramic-tile": [
    { name: "Glazed Ceramic", slug: "glazed", description: "Smooth colored surface finish" },
    { name: "Unglazed Ceramic", slug: "unglazed", description: "Natural clay color, matte" },
    { name: "Quarry Tile", slug: "quarry", description: "Thick, unglazed, often red/brown" },
    { name: "Mosaic Tile", slug: "mosaic", description: "Small tiles on mesh backing" },
    { name: "Decorative / Encaustic", slug: "decorative", description: "Patterned, hand-painted designs" },
    { name: "Subway Tile", slug: "subway", description: "Rectangular format, 3x6 classic" },
  ],
  "porcelain-tile": [
    { name: "Glazed Porcelain", slug: "glazed-porcelain", description: "Surface glaze over porcelain body" },
    { name: "Full-Body Porcelain", slug: "full-body", description: "Color runs through entire thickness" },
    { name: "Polished Porcelain", slug: "polished-porcelain", description: "High-gloss reflective surface" },
    { name: "Matte Porcelain", slug: "matte-porcelain", description: "Non-reflective finish" },
    { name: "Wood-Look Porcelain", slug: "wood-look-porcelain", description: "Long planks mimicking hardwood" },
    { name: "Large Format Porcelain", slug: "large-format", description: "Slabs over 24 inches" },
  ],
  "natural-stone": [
    { name: "Marble", slug: "marble", description: "Veined metamorphic stone, many varieties" },
    { name: "Granite", slug: "granite", description: "Granular igneous stone, very durable" },
    { name: "Slate", slug: "slate", description: "Layered texture, dark earth tones" },
    { name: "Travertine", slug: "travertine", description: "Warm beige, natural pitting" },
    { name: "Limestone", slug: "limestone", description: "Soft, earthy, matte sedimentary stone" },
    { name: "Sandstone", slug: "sandstone", description: "Gritty texture, warm earth tones" },
    { name: "Quartzite", slug: "quartzite", description: "Very hard metamorphic stone" },
  ],
  "carpet": [
    { name: "Broadloom Carpet", slug: "broadloom", description: "Wall-to-wall rolled carpet" },
    { name: "Carpet Tile", slug: "carpet-tile", description: "Modular squares, commercial standard" },
    { name: "Berber", slug: "berber", description: "Loop pile, flecked appearance" },
    { name: "Frieze", slug: "frieze", description: "Tightly twisted cut pile" },
    { name: "Plush / Saxony", slug: "plush", description: "Dense, even-cut pile, formal look" },
  ],
  "concrete": [
    { name: "Polished Concrete", slug: "polished", description: "Ground and polished to high sheen" },
    { name: "Stained Concrete", slug: "stained", description: "Acid or water-based stain applied" },
    { name: "Stamped Concrete", slug: "stamped", description: "Textured to mimic stone, brick, or tile" },
    { name: "Epoxy-Coated", slug: "epoxy", description: "Resinous coating, garage/commercial" },
    { name: "Microcement", slug: "microcement", description: "Thin cement overlay, seamless" },
  ],
  "other": [
    { name: "Cork", slug: "cork", description: "Renewable bark material, warm and soft" },
    { name: "Linoleum", slug: "linoleum", description: "Natural linseed oil-based sheet/tile" },
    { name: "Rubber", slug: "rubber", description: "Resilient, slip-resistant, commercial/gym" },
    { name: "Terrazzo", slug: "terrazzo", description: "Composite of marble chips in cement or resin" },
    { name: "Brick", slug: "brick", description: "Clay brick pavers, rustic style" },
  ],
};

// Cost defaults — national averages per category (applied to first type in each)
const costData: Record<string, { materialLow: number; materialHigh: number; laborLow: number; laborHigh: number; removalLow: number; removalHigh: number }> = {
  "hardwood-solid":       { materialLow: 5.00, materialHigh: 12.00, laborLow: 4.00, laborHigh: 8.00, removalLow: 1.50, removalHigh: 3.00 },
  "hardwood-engineered":  { materialLow: 4.00, materialHigh: 10.00, laborLow: 3.00, laborHigh: 7.00, removalLow: 1.50, removalHigh: 3.00 },
  "laminate":             { materialLow: 1.50, materialHigh: 5.00,  laborLow: 2.00, laborHigh: 4.00, removalLow: 0.75, removalHigh: 1.50 },
  "vinyl-luxury":         { materialLow: 2.50, materialHigh: 7.00,  laborLow: 2.00, laborHigh: 5.00, removalLow: 1.00, removalHigh: 2.00 },
  "vinyl-sheet":          { materialLow: 1.00, materialHigh: 4.00,  laborLow: 1.50, laborHigh: 3.50, removalLow: 0.75, removalHigh: 1.50 },
  "ceramic-tile":         { materialLow: 2.00, materialHigh: 8.00,  laborLow: 5.00, laborHigh: 10.00, removalLow: 2.00, removalHigh: 4.00 },
  "porcelain-tile":       { materialLow: 3.00, materialHigh: 10.00, laborLow: 5.00, laborHigh: 10.00, removalLow: 2.00, removalHigh: 4.00 },
  "natural-stone":        { materialLow: 5.00, materialHigh: 25.00, laborLow: 6.00, laborHigh: 12.00, removalLow: 2.50, removalHigh: 5.00 },
  "carpet":               { materialLow: 1.50, materialHigh: 6.00,  laborLow: 1.50, laborHigh: 3.00, removalLow: 0.50, removalHigh: 1.50 },
  "concrete":             { materialLow: 3.00, materialHigh: 8.00,  laborLow: 3.00, laborHigh: 7.00, removalLow: 2.00, removalHigh: 5.00 },
  "other":                { materialLow: 3.00, materialHigh: 10.00, laborLow: 3.00, laborHigh: 8.00, removalLow: 1.50, removalHigh: 3.00 },
};

async function seed() {
  console.log("Seeding floor categories...");
  const insertedCategories = await db
    .insert(floorCategories)
    .values(categories)
    .onConflictDoNothing()
    .returning();

  const categoryMap = new Map(
    insertedCategories.map((c) => [c.slug, c.id])
  );

  console.log(`Inserted ${insertedCategories.length} categories`);

  console.log("Seeding floor types...");
  let typeCount = 0;
  const typeIdMap = new Map<string, number>(); // categorySlug -> first type ID (for cost defaults)

  for (const [categorySlug, types] of Object.entries(typesByCategory)) {
    const categoryId = categoryMap.get(categorySlug);
    if (!categoryId) {
      console.warn(`Category ${categorySlug} not found, skipping types`);
      continue;
    }

    const inserted = await db
      .insert(floorTypes)
      .values(
        types.map((t, i) => ({
          categoryId,
          name: t.name,
          slug: t.slug,
          description: t.description,
          sortOrder: i + 1,
        }))
      )
      .onConflictDoNothing()
      .returning();

    if (inserted.length > 0) {
      typeIdMap.set(categorySlug, inserted[0].id);
    }
    typeCount += inserted.length;
  }

  console.log(`Inserted ${typeCount} floor types`);

  console.log("Seeding cost defaults...");
  let costCount = 0;

  for (const [categorySlug, costs] of Object.entries(costData)) {
    const firstTypeId = typeIdMap.get(categorySlug);
    if (!firstTypeId) continue;

    // Apply cost to all types in this category
    const categoryId = categoryMap.get(categorySlug);
    if (!categoryId) continue;

    const typesInCategory = typesByCategory[categorySlug];
    if (!typesInCategory) continue;

    // For simplicity, apply the same cost range to all types in the category
    // Companies can override individual types later
    for (let i = 0; i < typesInCategory.length; i++) {
      const typeId = firstTypeId + i;
      await db
        .insert(costDefaults)
        .values({
          floorTypeId: typeId,
          region: "national",
          materialLow: costs.materialLow,
          materialHigh: costs.materialHigh,
          laborLow: costs.laborLow,
          laborHigh: costs.laborHigh,
          removalLow: costs.removalLow,
          removalHigh: costs.removalHigh,
          source: "National average estimate (2026)",
          effectiveDate: "2026-04-01",
        })
        .onConflictDoNothing();
      costCount++;
    }
  }

  console.log(`Inserted ${costCount} cost defaults`);
  console.log("Seed complete!");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

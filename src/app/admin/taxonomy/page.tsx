import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { floorCategories, floorTypes } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

async function getTaxonomy() {
  const categories = await db
    .select()
    .from(floorCategories)
    .orderBy(floorCategories.sortOrder);

  const typeCounts = await db
    .select({
      categoryId: floorTypes.categoryId,
      total: count(),
    })
    .from(floorTypes)
    .groupBy(floorTypes.categoryId);

  const countMap = new Map(typeCounts.map((t) => [t.categoryId, t.total]));

  const types = await db
    .select()
    .from(floorTypes)
    .orderBy(floorTypes.categoryId, floorTypes.sortOrder);

  return { categories, types, countMap };
}

export default async function TaxonomyPage() {
  let data;
  try {
    data = await getTaxonomy();
  } catch {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load taxonomy. Check database connection and run seed.
      </div>
    );
  }

  const typesByCategory = new Map<number, typeof data.types>();
  for (const type of data.types) {
    const existing = typesByCategory.get(type.categoryId) || [];
    existing.push(type);
    typesByCategory.set(type.categoryId, existing);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Floor Taxonomy</h1>
        <Badge variant="outline">
          {data.categories.length} categories &middot;{" "}
          {data.types.length} types
        </Badge>
      </div>

      <div className="space-y-6">
        {data.categories.map((cat) => {
          const types = typesByCategory.get(cat.id) || [];
          return (
            <Card key={cat.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{cat.name}</CardTitle>
                  <Badge variant="secondary">
                    {data.countMap.get(cat.id) || 0} types
                  </Badge>
                </div>
                {cat.description && (
                  <p className="text-sm text-gray-500">{cat.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {types.map((type) => (
                    <Badge key={type.id} variant="outline">
                      {type.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

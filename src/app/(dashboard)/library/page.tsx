import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { floorCategories, floorTypes } from "@/lib/db/schema";

async function getLibrary() {
  const categories = await db
    .select()
    .from(floorCategories)
    .orderBy(floorCategories.sortOrder);

  const types = await db
    .select()
    .from(floorTypes)
    .orderBy(floorTypes.categoryId, floorTypes.sortOrder);

  return { categories, types };
}

export default async function LibraryPage() {
  let data;
  try {
    data = await getLibrary();
  } catch {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Floor Library
        </h1>
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Floor library data not available. Run the seed script to populate.
          </CardContent>
        </Card>
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
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Floor Library</h1>
        <p className="text-gray-600">
          Reference guide for all {data.types.length} floor types across{" "}
          {data.categories.length} categories
        </p>
      </div>

      <div className="space-y-6">
        {data.categories.map((cat) => {
          const types = typesByCategory.get(cat.id) || [];
          if (types.length === 0) return null;

          return (
            <Card key={cat.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{cat.name}</CardTitle>
                    {cat.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">{types.length} types</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {types.map((type) => (
                    <div
                      key={type.id}
                      className="rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900">{type.name}</p>
                      {type.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {type.description}
                        </p>
                      )}
                    </div>
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

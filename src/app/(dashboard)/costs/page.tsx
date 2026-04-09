import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { costDefaults, floorTypes, floorCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function CostsPage() {
  let costs: { category: string; type: string; materialLow: number; materialHigh: number; laborLow: number; laborHigh: number }[] = [];

  try {
    await getTenantContext();
    costs = await fetchCostData();
  } catch {
    // No org or DB — show empty
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cost Data</h1>
        <p className="text-gray-600">
          National average costs per square foot. Set company overrides in
          Settings.
        </p>
      </div>

      {costs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No cost data available. Run the seed script to populate defaults.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Default Rates (per sq ft)</CardTitle>
              <Badge variant="outline">National Average</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium text-right">
                      Material
                    </th>
                    <th className="pb-3 pr-4 font-medium text-right">Labor</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((c, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-gray-700">{c.category}</td>
                      <td className="py-3 pr-4 text-gray-900 font-medium">
                        {c.type}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-600">
                        ${c.materialLow.toFixed(2)}–${c.materialHigh.toFixed(2)}
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-600">
                        ${c.laborLow.toFixed(2)}–${c.laborHigh.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        ${(c.materialLow + c.laborLow).toFixed(2)}–$
                        {(c.materialHigh + c.laborHigh).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function fetchCostData() {
  const results = await db
    .select({
      category: floorCategories.name,
      type: floorTypes.name,
      materialLow: costDefaults.materialLow,
      materialHigh: costDefaults.materialHigh,
      laborLow: costDefaults.laborLow,
      laborHigh: costDefaults.laborHigh,
    })
    .from(costDefaults)
    .innerJoin(floorTypes, eq(costDefaults.floorTypeId, floorTypes.id))
    .innerJoin(floorCategories, eq(floorTypes.categoryId, floorCategories.id))
    .orderBy(floorCategories.sortOrder, floorTypes.sortOrder)
    .limit(50);

  return results;
}

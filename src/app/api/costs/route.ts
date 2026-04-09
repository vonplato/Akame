import { NextRequest } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant";
import { estimateCost, aiCategoryToDbSlug } from "@/lib/costs/estimator";

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext();

    const aiCategory = req.nextUrl.searchParams.get("category");
    const region = req.nextUrl.searchParams.get("region") || "national";

    if (!aiCategory) {
      return Response.json(
        { error: "category parameter is required" },
        { status: 400 }
      );
    }

    const dbSlug = aiCategoryToDbSlug(aiCategory);
    const estimate = await estimateCost(dbSlug, companyId, region);

    if (!estimate) {
      return Response.json(
        { error: "No cost data available for this floor type" },
        { status: 404 }
      );
    }

    return Response.json(estimate);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch costs";
    return Response.json({ error: message }, { status: 500 });
  }
}

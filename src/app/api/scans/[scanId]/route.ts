import { NextRequest } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { floorScans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { companyId } = await getTenantContext();
    const { scanId } = await params;

    const [scan] = await db
      .select()
      .from(floorScans)
      .where(
        and(eq(floorScans.id, scanId), eq(floorScans.companyId, companyId))
      )
      .limit(1);

    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    return Response.json(scan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch scan";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { companyId } = await getTenantContext();
    const { scanId } = await params;
    const body = await req.json();

    const [scan] = await db
      .update(floorScans)
      .set({ ...body, updatedAt: new Date() })
      .where(
        and(eq(floorScans.id, scanId), eq(floorScans.companyId, companyId))
      )
      .returning();

    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    return Response.json(scan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update scan";
    return Response.json({ error: message }, { status: 500 });
  }
}

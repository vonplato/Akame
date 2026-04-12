import { NextRequest } from "next/server";
import { z } from "zod";
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

const patchScanSchema = z.object({
  projectName: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
}).strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { companyId } = await getTenantContext();
    const { scanId } = await params;
    const body = await req.json();
    const data = patchScanSchema.parse(body);

    const [scan] = await db
      .update(floorScans)
      .set({
        projectName: data.projectName,
        location: data.location,
        notes: data.notes,
        tags: data.tags,
        updatedAt: new Date(),
      })
      .where(
        and(eq(floorScans.id, scanId), eq(floorScans.companyId, companyId))
      )
      .returning();

    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    return Response.json(scan);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: "Invalid input", details: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to update scan";
    return Response.json({ error: message }, { status: 500 });
  }
}

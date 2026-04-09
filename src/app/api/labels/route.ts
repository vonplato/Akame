import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { labels, floorScans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const createLabelSchema = z.object({
  scanId: z.string().uuid(),
  aiAgreed: z.boolean(),
  floorCategory: z.string(),
  floorType: z.string(),
  conditionRating: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await getTenantContext();
    const body = await req.json();
    const data = createLabelSchema.parse(body);

    // Verify the scan belongs to this company
    const [scan] = await db
      .select()
      .from(floorScans)
      .where(
        and(
          eq(floorScans.id, data.scanId),
          eq(floorScans.companyId, companyId)
        )
      )
      .limit(1);

    if (!scan) {
      return Response.json({ error: "Scan not found" }, { status: 404 });
    }

    // Create the label
    const [label] = await db
      .insert(labels)
      .values({
        scanId: data.scanId,
        companyId,
        userId,
        floorTypeId: 1, // Placeholder — will resolve from taxonomy in future
        aiAgreed: data.aiAgreed,
        conditionRating: data.conditionRating || null,
        notes: data.notes || null,
        labelQuality: "standard",
      })
      .returning();

    // Update the scan's review status
    await db
      .update(floorScans)
      .set({
        reviewStatus: data.aiAgreed ? "confirmed" : "corrected",
        reviewedAt: new Date(),
        reviewedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(floorScans.id, data.scanId));

    return Response.json(label, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input", details: err.issues },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to create label";
    return Response.json({ error: message }, { status: 500 });
  }
}

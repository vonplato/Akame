import { NextRequest } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { floorScans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { identifyFloor } from "@/lib/ai/claude-vision";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const { companyId } = await getTenantContext();
    const { scanId } = await params;

    // Fetch the scan
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

    // Mark as processing
    await db
      .update(floorScans)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(floorScans.id, scanId));

    try {
      // Run AI identification
      const result = await identifyFloor(scan.imageUrl);

      // Update scan with results
      const [updated] = await db
        .update(floorScans)
        .set({
          status: "completed",
          aiResult: result,
          aiConfidence: result.confidence,
          aiModelVersion: "claude-sonnet-4-20250514",
          conditionRating: result.condition.rating,
          conditionScore: result.condition.score,
          conditionDetails: {
            wear_level: result.condition.wear_level,
            damages: result.condition.damages,
            notes: result.condition.notes,
          },
          // Set final values to AI values by default (user can override)
          finalConfidence: result.confidence,
          updatedAt: new Date(),
        })
        .where(eq(floorScans.id, scanId))
        .returning();

      return Response.json(updated);
    } catch (aiError) {
      // Mark as failed if AI errors
      await db
        .update(floorScans)
        .set({
          status: "failed",
          updatedAt: new Date(),
        })
        .where(eq(floorScans.id, scanId));

      console.error("AI identification failed:", aiError);
      return Response.json(
        { error: "AI identification failed" },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Identification failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

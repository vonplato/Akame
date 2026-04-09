import { NextRequest } from "next/server";
import { z } from "zod";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { floorScans } from "@/lib/db/schema";
import { eq, desc, and, count } from "drizzle-orm";

const createScanSchema = z.object({
  imageUrl: z.string().url(),
  imageKey: z.string().min(1),
  projectName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await getTenantContext();
    const body = await req.json();
    const data = createScanSchema.parse(body);

    const [scan] = await db
      .insert(floorScans)
      .values({
        companyId,
        userId,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
        projectName: data.projectName || null,
        location: data.location || null,
        notes: data.notes || null,
        status: "pending",
        reviewStatus: "unreviewed",
      })
      .returning();

    return Response.json(scan, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input", details: err.issues },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to create scan";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit") || "20"),
      100
    );
    const offset = (page - 1) * limit;

    const [scans, [{ total }]] = await Promise.all([
      db
        .select()
        .from(floorScans)
        .where(eq(floorScans.companyId, companyId))
        .orderBy(desc(floorScans.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(floorScans)
        .where(eq(floorScans.companyId, companyId)),
    ]);

    return Response.json({
      scans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch scans";
    return Response.json({ error: message }, { status: 500 });
  }
}

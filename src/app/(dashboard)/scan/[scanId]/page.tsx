import { notFound } from "next/navigation";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { floorScans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ScanDetailClient } from "./client";

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  let scan;
  try {
    const { companyId } = await getTenantContext();
    const [result] = await db
      .select()
      .from(floorScans)
      .where(
        and(eq(floorScans.id, scanId), eq(floorScans.companyId, companyId))
      )
      .limit(1);
    scan = result;
  } catch {
    notFound();
  }

  if (!scan) notFound();

  return <ScanDetailClient scan={scan} />;
}

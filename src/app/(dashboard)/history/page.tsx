import Link from "next/link";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { floorScans } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/constants";

export default async function HistoryPage() {
  let scans: Awaited<ReturnType<typeof fetchScans>> = [];

  try {
    scans = await fetchScans();
  } catch {
    // No org selected or DB not connected — show empty state
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
        <p className="text-gray-600">View all past floor scans</p>
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-gray-500">No scans yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Scans will appear here after you take your first photo
              </p>
              <Link
                href="/scan"
                className="mt-4 text-sm font-medium text-blue-600 hover:underline"
              >
                Take your first scan
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => (
            <Link key={scan.id} href={`/scan/${scan.id}`}>
              <Card className="transition-colors hover:bg-gray-50">
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Thumbnail */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {scan.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={scan.imageUrl}
                        alt="Floor scan"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {scan.projectName || "Untitled Scan"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {scan.location || "No location"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(scan.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Status */}
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[scan.status] || ""}
                  >
                    {scan.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function fetchScans() {
  const { companyId } = await getTenantContext();
  return db
    .select()
    .from(floorScans)
    .where(eq(floorScans.companyId, companyId))
    .orderBy(desc(floorScans.createdAt))
    .limit(50);
}

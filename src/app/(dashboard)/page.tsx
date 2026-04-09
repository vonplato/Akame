import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTenantContext } from "@/lib/auth/tenant";
import { db } from "@/lib/db";
import { floorScans } from "@/lib/db/schema";
import { eq, and, count, desc, gte } from "drizzle-orm";

async function getStats(companyId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalResult, awaitingResult, monthResult] = await Promise.all([
    db
      .select({ total: count() })
      .from(floorScans)
      .where(eq(floorScans.companyId, companyId)),
    db
      .select({ total: count() })
      .from(floorScans)
      .where(
        and(
          eq(floorScans.companyId, companyId),
          eq(floorScans.reviewStatus, "unreviewed"),
          eq(floorScans.status, "completed")
        )
      ),
    db
      .select({ total: count() })
      .from(floorScans)
      .where(
        and(
          eq(floorScans.companyId, companyId),
          gte(floorScans.createdAt, startOfMonth)
        )
      ),
  ]);

  return {
    total: totalResult[0].total,
    awaiting: awaitingResult[0].total,
    thisMonth: monthResult[0].total,
  };
}

async function getRecentScans(companyId: string) {
  return db
    .select()
    .from(floorScans)
    .where(eq(floorScans.companyId, companyId))
    .orderBy(desc(floorScans.createdAt))
    .limit(5);
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default async function DashboardPage() {
  let stats = { total: 0, awaiting: 0, thisMonth: 0 };
  let recentScans: Awaited<ReturnType<typeof getRecentScans>> = [];

  try {
    const { companyId } = await getTenantContext();
    [stats, recentScans] = await Promise.all([
      getStats(companyId),
      getRecentScans(companyId),
    ]);
  } catch {
    // No org selected or DB not connected
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Akame Floor</p>
      </div>

      <div className="mb-8">
        <Link href="/scan">
          <Button size="lg" className="w-full md:w-auto">
            New Floor Scan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Awaiting Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.awaiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.thisMonth}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Scans</CardTitle>
            {recentScans.length > 0 && (
              <Link
                href="/history"
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500">No scans yet</p>
              <p className="mt-1 text-sm text-gray-400">
                Take your first floor photo to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <Link key={scan.id} href={`/scan/${scan.id}`}>
                  <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scan.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {scan.projectName || "Untitled Scan"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusColors[scan.status] || ""}
                    >
                      {scan.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

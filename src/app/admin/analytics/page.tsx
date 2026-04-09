import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { floorScans, labels } from "@/lib/db/schema";
import { count, eq, and, sql } from "drizzle-orm";

async function getAnalytics() {
  const [totalScans] = await db
    .select({ total: count() })
    .from(floorScans);

  const [completedScans] = await db
    .select({ total: count() })
    .from(floorScans)
    .where(eq(floorScans.status, "completed"));

  const [totalLabels] = await db
    .select({ total: count() })
    .from(labels);

  const [confirmedLabels] = await db
    .select({ total: count() })
    .from(labels)
    .where(eq(labels.aiAgreed, true));

  const [correctedLabels] = await db
    .select({ total: count() })
    .from(labels)
    .where(eq(labels.aiAgreed, false));

  const agreementRate =
    totalLabels.total > 0
      ? Math.round((confirmedLabels.total / totalLabels.total) * 100)
      : 0;

  // Scans by status
  const statusCounts = await db
    .select({
      status: floorScans.status,
      total: count(),
    })
    .from(floorScans)
    .groupBy(floorScans.status);

  // Review status distribution
  const reviewCounts = await db
    .select({
      reviewStatus: floorScans.reviewStatus,
      total: count(),
    })
    .from(floorScans)
    .groupBy(floorScans.reviewStatus);

  return {
    totalScans: totalScans.total,
    completedScans: completedScans.total,
    totalLabels: totalLabels.total,
    confirmedLabels: confirmedLabels.total,
    correctedLabels: correctedLabels.total,
    agreementRate,
    statusCounts,
    reviewCounts,
  };
}

export default async function AnalyticsPage() {
  let analytics;
  try {
    analytics = await getAnalytics();
  } catch {
    return (
      <div className="text-center py-12 text-gray-500">
        Unable to load analytics. Check database connection.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Platform Analytics
      </h1>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <MetricCard
          title="Total Scans"
          value={analytics.totalScans}
        />
        <MetricCard
          title="Completed"
          value={analytics.completedScans}
        />
        <MetricCard
          title="Total Labels"
          value={analytics.totalLabels}
        />
        <MetricCard
          title="AI Agreement Rate"
          value={`${analytics.agreementRate}%`}
          subtitle={`${analytics.confirmedLabels} confirmed / ${analytics.correctedLabels} corrected`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Scans by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.statusCounts.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.statusCounts.map((s) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {s.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-blue-200" style={{
                        width: `${Math.max(20, (s.total / Math.max(analytics.totalScans, 1)) * 200)}px`
                      }} />
                      <span className="text-sm text-gray-500 w-8 text-right">
                        {s.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Review Status</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.reviewCounts.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.reviewCounts.map((r) => (
                  <div key={r.reviewStatus} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {r.reviewStatus}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-green-200" style={{
                        width: `${Math.max(20, (r.total / Math.max(analytics.totalScans, 1)) * 200)}px`
                      }} />
                      <span className="text-sm text-gray-500 w-8 text-right">
                        {r.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

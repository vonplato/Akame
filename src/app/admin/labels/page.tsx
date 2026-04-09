import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { labels, floorScans, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function getRecentLabels() {
  return db
    .select({
      id: labels.id,
      scanId: labels.scanId,
      aiAgreed: labels.aiAgreed,
      conditionRating: labels.conditionRating,
      notes: labels.notes,
      labelQuality: labels.labelQuality,
      createdAt: labels.createdAt,
      userEmail: users.email,
      userName: users.name,
      scanImage: floorScans.imageUrl,
      scanProject: floorScans.projectName,
    })
    .from(labels)
    .leftJoin(users, eq(labels.userId, users.id))
    .leftJoin(floorScans, eq(labels.scanId, floorScans.id))
    .orderBy(desc(labels.createdAt))
    .limit(50);
}

export default async function LabelsPage() {
  let recentLabels: Awaited<ReturnType<typeof getRecentLabels>> = [];
  try {
    recentLabels = await getRecentLabels();
  } catch {
    // DB not available
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Label Review</h1>
        <Badge variant="outline">{recentLabels.length} labels</Badge>
      </div>

      {recentLabels.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No labels submitted yet. Labels appear here when users confirm or
            correct AI identifications.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentLabels.map((label) => (
            <Card key={label.id}>
              <CardContent className="flex items-center gap-4 py-4">
                {/* Scan thumbnail */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {label.scanImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={label.scanImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {label.scanProject || "Untitled Scan"}
                  </p>
                  <p className="text-xs text-gray-500">
                    By {label.userName || label.userEmail || "Unknown"} &middot;{" "}
                    {new Date(label.createdAt).toLocaleDateString()}
                  </p>
                  {label.notes && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {label.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      label.aiAgreed
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {label.aiAgreed ? "Confirmed" : "Corrected"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {label.labelQuality}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

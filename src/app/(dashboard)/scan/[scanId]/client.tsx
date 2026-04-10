"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScanResultCard } from "@/components/scan/scan-result-card";
import { CorrectionForm } from "@/components/scan/correction-form";
import { CostEstimate } from "@/components/scan/cost-estimate";
import type { FloorScan } from "@/lib/db/schema";
import type { FloorIdentificationResult } from "@/lib/ai/parse-result";

interface ScanDetailClientProps {
  scan: FloorScan;
}

export function ScanDetailClient({ scan: initialScan }: ScanDetailClientProps) {
  const router = useRouter();
  const [scan, setScan] = useState(initialScan);
  const reviewed = scan.reviewStatus !== "unreviewed";

  useEffect(() => {
    if (scan.status !== "pending" && scan.status !== "processing") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/scans/${scan.id}`);
      if (res.ok) {
        const updated = await res.json();
        if (updated.status !== scan.status || updated.updatedAt !== scan.updatedAt) {
          setScan(updated);
        }
        if (updated.status === "completed" || updated.status === "failed") {
          clearInterval(interval);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scan.id, scan.status, scan.updatedAt]);

  const aiResult = scan.aiResult as FloorIdentificationResult | null;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {scan.projectName || "Floor Scan"}
          </h1>
          {scan.location && (
            <p className="text-gray-600">{scan.location}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {new Date(scan.createdAt).toLocaleString()}
          </p>
        </div>
        <Link href="/history">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        {/* Floor image */}
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scan.imageUrl}
              alt="Floor scan"
              className="w-full object-contain max-h-[50vh]"
            />
          </CardContent>
        </Card>

        {/* Status indicators */}
        {(scan.status === "pending" || scan.status === "processing") && (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-gray-600">
                {scan.status === "pending"
                  ? "Waiting for analysis..."
                  : "Analyzing floor..."}
              </p>
            </CardContent>
          </Card>
        )}

        {scan.status === "failed" && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-600 font-medium">Analysis Failed</p>
              <p className="text-sm text-gray-500 mt-1">
                The AI could not analyze this image. Try uploading a clearer
                photo.
              </p>
              <Link href="/scan">
                <Button className="mt-4">Try Again</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* AI results */}
        {scan.status === "completed" && aiResult && (
          <>
            <ScanResultCard result={aiResult} />

            {/* Cost estimate */}
            <CostEstimate floorCategory={aiResult.floor_category} />

            {/* Human-in-the-loop correction */}
            {!reviewed && (
              <CorrectionForm
                scanId={scan.id}
                aiResult={aiResult}
                onSubmitted={() => {
                  setScan((s) => ({ ...s, reviewStatus: "confirmed" }));
                  router.refresh();
                }}
              />
            )}

            {reviewed && (
              <Card>
                <CardContent className="py-4 text-center">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {scan.reviewStatus === "confirmed"
                      ? "Confirmed"
                      : "Corrected"}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    Thank you for your feedback! This helps improve our AI.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Notes */}
        {scan.notes && (
          <Card>
            <CardContent className="py-3">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-sm">{scan.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

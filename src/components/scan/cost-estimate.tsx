"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CostData {
  perSqFt: {
    materialLow: number;
    materialHigh: number;
    laborLow: number;
    laborHigh: number;
    totalLow: number;
    totalHigh: number;
  };
  removalPerSqFt: { low: number; high: number } | null;
  source: "company" | "national_average";
  region: string;
}

interface CostEstimateProps {
  floorCategory: string;
}

export function CostEstimate({ floorCategory }: CostEstimateProps) {
  const [cost, setCost] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCost() {
      try {
        const res = await fetch(
          `/api/costs?category=${encodeURIComponent(floorCategory)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCost(data);
        }
      } catch {
        // Cost data unavailable
      } finally {
        setLoading(false);
      }
    }
    fetchCost();
  }, [floorCategory]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-gray-400">
          Loading cost data...
        </CardContent>
      </Card>
    );
  }

  if (!cost) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-gray-400">
          Cost data not available for this floor type
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Cost Estimate</CardTitle>
          <Badge variant="outline" className="text-xs">
            {cost.source === "company" ? "Custom rates" : "National avg"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CostRow
            label="Material"
            low={cost.perSqFt.materialLow}
            high={cost.perSqFt.materialHigh}
          />
          <CostRow
            label="Labor"
            low={cost.perSqFt.laborLow}
            high={cost.perSqFt.laborHigh}
          />
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total / sq ft</span>
            <span className="font-bold text-lg">
              ${cost.perSqFt.totalLow.toFixed(2)} – $
              {cost.perSqFt.totalHigh.toFixed(2)}
            </span>
          </div>
        </div>

        {cost.removalPerSqFt && (
          <div className="border-t pt-3">
            <CostRow
              label="Removal"
              low={cost.removalPerSqFt.low}
              high={cost.removalPerSqFt.high}
            />
          </div>
        )}

        <p className="text-xs text-gray-400">
          Estimates are per square foot in USD. Actual costs vary by region,
          contractor, and specific materials.
        </p>
      </CardContent>
    </Card>
  );
}

function CostRow({
  label,
  low,
  high,
}: {
  label: string;
  low: number;
  high: number;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label} / sq ft</p>
      <p className="font-medium">
        ${low.toFixed(2)} – ${high.toFixed(2)}
      </p>
    </div>
  );
}

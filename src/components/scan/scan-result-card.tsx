import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "./confidence-badge";
import { CATEGORY_LABEL_MAP, CONDITION_COLORS } from "@/lib/constants";
import type { FloorIdentificationResult } from "@/lib/ai/parse-result";

interface ScanResultCardProps {
  result: FloorIdentificationResult;
}

const severityColors: Record<string, string> = {
  minor: "text-yellow-700",
  moderate: "text-orange-700",
  severe: "text-red-700",
};

export function ScanResultCard({ result }: ScanResultCardProps) {
  return (
    <div className="space-y-4">
      {/* Identification */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Floor Identification</CardTitle>
            <ConfidenceBadge confidence={result.confidence} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-lg font-semibold">
              {CATEGORY_LABEL_MAP[result.floor_category] || result.floor_category}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-lg font-semibold">{result.floor_type}</p>
          </div>

          {/* Material details */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {result.material_details.color_family && (
              <Detail label="Color" value={result.material_details.color_family} />
            )}
            {result.material_details.finish_type && (
              <Detail label="Finish" value={result.material_details.finish_type} />
            )}
            {result.material_details.plank_width && (
              <Detail
                label="Plank Width"
                value={`${result.material_details.plank_width}"`}
              />
            )}
            {result.material_details.installation_pattern && (
              <Detail
                label="Pattern"
                value={result.material_details.installation_pattern}
              />
            )}
            {result.material_details.estimated_age && (
              <Detail label="Est. Age" value={result.material_details.estimated_age} />
            )}
            {result.material_details.grain_pattern && (
              <Detail label="Grain" value={result.material_details.grain_pattern} />
            )}
          </div>

          {/* Notable features */}
          {result.material_details.notable_features &&
            result.material_details.notable_features.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-gray-500 mb-1">Notable Features</p>
                <div className="flex flex-wrap gap-1">
                  {result.material_details.notable_features.map((f, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500 mb-2">Could also be</p>
              <div className="space-y-1">
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{alt.floor_type}</span>
                    <span className="text-gray-400">
                      {Math.round(alt.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500 mb-1">AI Reasoning</p>
            <p className="text-sm text-gray-700">{result.reasoning}</p>
          </div>
        </CardContent>
      </Card>

      {/* Condition Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Condition Assessment</CardTitle>
            <Badge
              variant="secondary"
              className={CONDITION_COLORS[result.condition.rating] || ""}
            >
              {result.condition.rating} ({result.condition.score}/10)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Wear Level</p>
            <p className="font-medium capitalize">{result.condition.wear_level}</p>
          </div>

          {result.condition.notes && (
            <p className="text-sm text-gray-700">{result.condition.notes}</p>
          )}

          {/* Damages */}
          {result.condition.damages && result.condition.damages.length > 0 && (
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-2">Detected Issues</p>
              <div className="space-y-2">
                {result.condition.damages.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-gray-50 p-2 text-sm"
                  >
                    <span
                      className={`font-medium capitalize ${severityColors[d.severity] || ""}`}
                    >
                      {d.type.replace(/_/g, " ")}
                    </span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {d.severity}
                    </Badge>
                    {d.notes && (
                      <p className="text-gray-500 text-xs w-full mt-1">
                        {d.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium capitalize">{value.replace(/_/g, " ")}</p>
    </div>
  );
}

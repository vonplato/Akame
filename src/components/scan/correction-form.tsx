"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FloorIdentificationResult } from "@/lib/ai/parse-result";

interface CorrectionFormProps {
  scanId: string;
  aiResult: FloorIdentificationResult;
  onSubmitted: () => void;
}

const FLOOR_CATEGORIES = [
  { value: "hardwood_solid", label: "Solid Hardwood" },
  { value: "hardwood_engineered", label: "Engineered Hardwood" },
  { value: "laminate", label: "Laminate" },
  { value: "vinyl_luxury", label: "Luxury Vinyl" },
  { value: "vinyl_sheet", label: "Sheet Vinyl" },
  { value: "ceramic_tile", label: "Ceramic Tile" },
  { value: "porcelain_tile", label: "Porcelain Tile" },
  { value: "natural_stone", label: "Natural Stone" },
  { value: "carpet", label: "Carpet" },
  { value: "concrete", label: "Concrete" },
  { value: "other", label: "Other / Specialty" },
];

const CONDITION_RATINGS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "critical", label: "Critical" },
];

export function CorrectionForm({
  scanId,
  aiResult,
  onSubmitted,
}: CorrectionFormProps) {
  const [mode, setMode] = useState<"idle" | "correcting" | "submitting">("idle");
  const [category, setCategory] = useState(aiResult.floor_category);
  const [floorType, setFloorType] = useState(aiResult.floor_type);
  const [condition, setCondition] = useState(aiResult.condition.rating);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setMode("submitting");
    setError(null);
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          aiAgreed: true,
          floorCategory: aiResult.floor_category,
          floorType: aiResult.floor_type,
          conditionRating: aiResult.condition.rating,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      onSubmitted();
    } catch {
      setError("Failed to submit confirmation");
      setMode("idle");
    }
  };

  const handleCorrection = async () => {
    setMode("submitting");
    setError(null);
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId,
          aiAgreed: false,
          floorCategory: category,
          floorType,
          conditionRating: condition,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      onSubmitted();
    } catch {
      setError("Failed to submit correction");
      setMode("submitting");
    }
  };

  if (mode === "idle") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Is this correct?</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            className="flex-1"
            variant="default"
            onClick={handleConfirm}
          >
            Yes, correct
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => setMode("correcting")}
          >
            No, correct it
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === "submitting") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="ml-2 text-gray-600">Submitting...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Correct Identification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <Label>Floor Category</Label>
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FLOOR_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Specific Type</Label>
          <input
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={floorType}
            onChange={(e) => setFloorType(e.target.value)}
            placeholder="e.g., Red Oak, LVP, Porcelain"
          />
        </div>

        <div>
          <Label>Condition</Label>
          <Select value={condition} onValueChange={(v) => v && setCondition(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_RATINGS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={2}
          />
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleCorrection}>
            Submit Correction
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMode("idle")}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

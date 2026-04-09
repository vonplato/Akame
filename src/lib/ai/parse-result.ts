import { z } from "zod";

const damageSchema = z.object({
  type: z.string(),
  severity: z.enum(["minor", "moderate", "severe"]),
  notes: z.string().optional(),
});

const alternativeSchema = z.object({
  floor_category: z.string(),
  floor_type: z.string(),
  confidence: z.number().min(0).max(1),
});

export const floorIdentificationSchema = z.object({
  floor_category: z.string(),
  floor_type: z.string(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(alternativeSchema).optional().default([]),
  condition: z.object({
    rating: z.enum(["excellent", "good", "fair", "poor", "critical"]),
    score: z.number().min(1).max(10),
    wear_level: z.enum(["none", "light", "moderate", "heavy"]),
    damages: z.array(damageSchema).optional().default([]),
    notes: z.string().optional(),
  }),
  material_details: z.object({
    grain_pattern: z.string().nullable().optional(),
    color_family: z.string().nullable().optional(),
    finish_type: z.string().nullable().optional(),
    plank_width: z.string().nullable().optional(),
    installation_pattern: z.string().nullable().optional(),
    estimated_age: z.string().nullable().optional(),
    notable_features: z.array(z.string()).optional().default([]),
  }),
  reasoning: z.string(),
});

export type FloorIdentificationResult = z.infer<typeof floorIdentificationSchema>;

export function parseAiResponse(text: string): FloorIdentificationResult {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(cleaned);
  return floorIdentificationSchema.parse(parsed);
}

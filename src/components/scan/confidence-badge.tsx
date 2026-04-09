import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);

  const colorClass =
    pct >= 85
      ? "bg-green-100 text-green-800"
      : pct >= 60
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <Badge variant="secondary" className={cn(colorClass, className)}>
      {pct}% confidence
    </Badge>
  );
}

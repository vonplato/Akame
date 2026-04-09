"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  image: Blob | File;
  onConfirm: () => void;
  onRetake: () => void;
}

export function ImagePreview({ image, onConfirm, onRetake }: ImagePreviewProps) {
  const previewUrl = useMemo(() => URL.createObjectURL(image), [image]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full overflow-hidden rounded-xl border">
        <Image
          src={previewUrl}
          alt="Floor preview"
          width={800}
          height={600}
          className="w-full object-contain max-h-[60vh]"
          unoptimized
        />
      </div>

      <div className="flex w-full gap-3">
        <Button variant="outline" className="flex-1" onClick={onRetake}>
          Retake
        </Button>
        <Button className="flex-1" onClick={onConfirm}>
          Analyze Floor
        </Button>
      </div>
    </div>
  );
}

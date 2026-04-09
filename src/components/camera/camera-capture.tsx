"use client";

import { useEffect } from "react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const { videoRef, isActive, error, start, stop, captureAsync, flipCamera } =
    useCamera();

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  const handleCapture = async () => {
    const blob = await captureAsync();
    if (blob) {
      stop();
      onCapture(blob);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-600">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => start()}>
            Retry
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-[70vh] object-cover"
      />

      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent p-6 pb-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <button
            onClick={handleCapture}
            className="h-16 w-16 rounded-full border-4 border-white bg-white/20 transition-transform active:scale-90"
            aria-label="Take photo"
          />

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={flipCamera}
          >
            Flip
          </Button>
        </div>
      )}
    </div>
  );
}

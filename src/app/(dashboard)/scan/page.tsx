"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CameraCapture } from "@/components/camera/camera-capture";
import { ImageUpload } from "@/components/camera/image-upload";
import { ImagePreview } from "@/components/camera/image-preview";
import { useScan } from "@/hooks/use-scan";

export default function ScanPage() {
  const router = useRouter();
  const scan = useScan();
  const [mode, setMode] = useState<"choose" | "camera" | "upload">("choose");
  const [meta, setMeta] = useState({
    projectName: "",
    location: "",
    notes: "",
  });

  const handleCapture = (blob: Blob) => {
    scan.setImage(blob);
    setMode("choose");
  };

  const handleFileSelect = (file: File) => {
    scan.setImage(file);
  };

  const handleConfirm = async () => {
    const scanId = await scan.upload({
      projectName: meta.projectName || undefined,
      location: meta.location || undefined,
      notes: meta.notes || undefined,
    });
    if (scanId) {
      router.push(`/scan/${scanId}`);
    }
  };

  // Camera mode
  if (mode === "camera") {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onCancel={() => setMode("choose")}
      />
    );
  }

  // Uploading / processing state
  if (scan.step === "uploading" || scan.step === "processing") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-gray-600">{scan.progress}</p>
      </div>
    );
  }

  // Error state
  if (scan.step === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-red-600">{scan.error}</p>
        <Button onClick={scan.reset}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Scan</h1>
        <p className="text-gray-600">
          Take a photo or upload an image of a floor
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        {/* Image capture/preview */}
        {scan.step === "preview" && scan.image ? (
          <ImagePreview
            image={scan.image}
            onConfirm={handleConfirm}
            onRetake={scan.reset}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Capture Floor Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setMode("camera")}
              >
                Open Camera
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <ImageUpload onSelect={handleFileSelect} />
            </CardContent>
          </Card>
        )}

        {/* Metadata form — shown during preview */}
        {scan.step === "preview" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details (optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., 123 Main St Kitchen"
                  value={meta.projectName}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, projectName: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Living Room, 2nd Floor"
                  value={meta.location}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, location: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional context..."
                  rows={2}
                  value={meta.notes}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, notes: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

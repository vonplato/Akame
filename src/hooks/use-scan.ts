"use client";

import { useState } from "react";

type ScanStep = "capture" | "preview" | "uploading" | "processing" | "done" | "error";

interface ScanState {
  step: ScanStep;
  image: Blob | File | null;
  scanId: string | null;
  error: string | null;
  progress: string;
}

export function useScan() {
  const [state, setState] = useState<ScanState>({
    step: "capture",
    image: null,
    scanId: null,
    error: null,
    progress: "",
  });

  const setImage = (image: Blob | File) => {
    setState((s) => ({ ...s, image, step: "preview" }));
  };

  const reset = () => {
    setState({
      step: "capture",
      image: null,
      scanId: null,
      error: null,
      progress: "",
    });
  };

  const upload = async (meta?: {
    projectName?: string;
    location?: string;
    notes?: string;
  }) => {
    if (!state.image) return;

    try {
      setState((s) => ({ ...s, step: "uploading", progress: "Getting upload URL..." }));

      // 1. Get presigned URL
      const contentType = state.image.type || "image/jpeg";
      const size = state.image.size;
      const presignedRes = await fetch(
        `/api/upload/presigned?contentType=${encodeURIComponent(contentType)}&size=${size}`
      );
      if (!presignedRes.ok) {
        const errBody = await presignedRes.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to get upload URL");
      }
      const { uploadUrl, key, publicUrl } = await presignedRes.json();

      // 2. Upload directly to R2
      setState((s) => ({ ...s, progress: "Uploading image..." }));
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: state.image,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(size),
        },
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      // 3. Create scan record
      setState((s) => ({ ...s, progress: "Creating scan..." }));
      const scanRes = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: publicUrl,
          imageKey: key,
          ...meta,
        }),
      });
      if (!scanRes.ok) {
        throw new Error("Failed to create scan");
      }
      const scan = await scanRes.json();

      // 4. Trigger AI identification
      setState((s) => ({ ...s, step: "processing", progress: "Analyzing floor...", scanId: scan.id }));
      const identifyRes = await fetch(`/api/scans/${scan.id}/identify`, {
        method: "POST",
      });
      if (!identifyRes.ok) {
        // Non-fatal — scan exists, AI just failed
        console.error("AI identification failed");
      }

      setState((s) => ({ ...s, step: "done", progress: "" }));
      return scan.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState((s) => ({ ...s, step: "error", error: message }));
      return null;
    }
  };

  return { ...state, setImage, reset, upload };
}

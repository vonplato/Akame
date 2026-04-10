"use client";

import { useCallback, useRef, useState } from "react";

type CameraFacing = "environment" | "user";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facing, setFacing] = useState<CameraFacing>("environment");
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (requestedFacing?: CameraFacing) => {
      try {
        setError(null);
        const facingMode = requestedFacing || facing;

        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setIsActive(true);
        setFacing(facingMode);
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera access denied. Please allow camera permissions in your browser settings."
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "No camera found on this device."
              : "Failed to access camera.";
        setError(message);
        setIsActive(false);
      }
    },
    [facing]
  );

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const captureAsync = useCallback((): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || !isActive) return Promise.resolve(null);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);

    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.9
      );
    });
  }, [isActive]);

  const flipCamera = useCallback(() => {
    const newFacing = facing === "environment" ? "user" : "environment";
    start(newFacing);
  }, [facing, start]);

  return {
    videoRef,
    isActive,
    facing,
    error,
    start,
    stop,
    captureAsync,
    flipCamera,
  };
}

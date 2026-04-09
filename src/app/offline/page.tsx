"use client";

import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-6">
        <span className="text-white font-bold text-2xl">AF</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">You&apos;re Offline</h1>
      <p className="mt-2 max-w-sm text-gray-600">
        Akame Floor needs an internet connection to analyze floors and sync
        data. Previously viewed scans may still be available.
      </p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
}

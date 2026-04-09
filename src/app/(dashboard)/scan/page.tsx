import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ScanPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Scan</h1>
        <p className="text-gray-600">
          Take a photo or upload an image of a floor
        </p>
      </div>

      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Capture Floor Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">Camera component coming soon</p>
            <p className="mt-1 text-sm text-gray-400">
              Phase 2 will add camera capture and image upload
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

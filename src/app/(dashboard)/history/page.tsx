import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
        <p className="text-gray-600">View all past floor scans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500">No scans yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Scans will appear here after you take your first photo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

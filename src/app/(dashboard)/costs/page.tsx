import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CostsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cost Data</h1>
        <p className="text-gray-600">
          Manage material and labor costs for your company
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Overrides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500">
              Cost management coming in Phase 4
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Set your company&apos;s custom material and labor rates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

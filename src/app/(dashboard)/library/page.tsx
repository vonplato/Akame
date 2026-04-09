import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LibraryPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Floor Library</h1>
        <p className="text-gray-600">
          Reference guide for all floor types and materials
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Floor Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500">Floor library coming in Phase 6</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

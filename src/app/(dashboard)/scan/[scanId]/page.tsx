export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Scan Result</h1>
        <p className="text-gray-600">Scan ID: {scanId}</p>
      </div>

      <div className="text-center py-12 text-gray-500">
        Scan result view coming in Phase 3
      </div>
    </div>
  );
}

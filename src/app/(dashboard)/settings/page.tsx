import { OrganizationProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your company and team</p>
      </div>

      <OrganizationProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none border rounded-xl",
          },
        }}
      />
    </div>
  );
}

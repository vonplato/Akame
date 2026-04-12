import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== "platform_admin") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/analytics" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">AF</span>
              </div>
              <span className="font-bold text-sm">Admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/admin/analytics"
                className="text-gray-600 hover:text-gray-900"
              >
                Analytics
              </Link>
              <Link
                href="/admin/labels"
                className="text-gray-600 hover:text-gray-900"
              >
                Labels
              </Link>
              <Link
                href="/admin/taxonomy"
                className="text-gray-600 hover:text-gray-900"
              >
                Taxonomy
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Back to App
            </Link>
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs">AF</span>
            </div>
            <OrganizationSwitcher
              hidePersonal
              appearance={{
                elements: {
                  rootBox: "max-w-[180px]",
                  organizationSwitcherTrigger: "text-sm",
                },
              }}
            />
          </div>
          <UserButton />
        </header>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

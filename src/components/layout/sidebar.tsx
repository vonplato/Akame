"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", section: "main" },
  { href: "/scan", label: "New Scan", section: "main" },
  { href: "/history", label: "Scan History", section: "main" },
  { href: "/library", label: "Floor Library", section: "main" },
  { href: "/costs", label: "Cost Data", section: "manage" },
  { href: "/settings", label: "Settings", section: "manage" },
];

export function Sidebar() {
  const pathname = usePathname();

  const mainItems = sidebarItems.filter((i) => i.section === "main");
  const manageItems = sidebarItems.filter((i) => i.section === "manage");

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-gray-50">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AF</span>
        </div>
        <span className="text-lg font-bold">Akame Floor</span>
      </div>

      <div className="p-4">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger: "w-full justify-between",
            },
          }}
        />
      </div>

      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {mainItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Manage
          </p>
          <div className="mt-2 space-y-1">
            {manageItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t p-4">
        <UserButton
          showName
          appearance={{
            elements: {
              rootBox: "w-full",
              userButtonBox: "flex-row-reverse justify-between w-full",
            },
          }}
        />
      </div>
    </aside>
  );
}

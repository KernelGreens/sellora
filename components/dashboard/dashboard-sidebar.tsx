import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export function DashboardSidebar() {
  return (
    <aside className="hidden border-r bg-sidebar lg:block">
      <div className="p-6">
        <Link href="/dashboard" className="inline-flex items-center text-foreground">
          <BrandLogo size="sm" />
        </Link>
      </div>

      <DashboardNav className="px-3" />
    </aside>
  );
}

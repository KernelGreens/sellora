import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export function DashboardSidebar() {
  return (
    <aside className="hidden border-r bg-sidebar lg:block">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-semibold">
          Sellora
        </Link>
      </div>

      <DashboardNav className="px-3" />
    </aside>
  );
}

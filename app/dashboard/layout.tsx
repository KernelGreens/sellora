import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { getServerAuthUser } from "@/lib/auth-session";
import { getDashboardAccountIdentity } from "@/lib/services/account.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const accountIdentity = await getDashboardAccountIdentity(user.id);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardTopbar
            user={{
              name: accountIdentity?.fullName || user.name || "User",
              email: accountIdentity?.email || user.email || "",
            }}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

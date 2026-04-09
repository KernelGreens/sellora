import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { getServerAuthUser } from "@/lib/auth-session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <div className="flex flex-col">
          <DashboardTopbar
            user={{
              name: user.name || "User",
              email: user.email || "",
            }}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

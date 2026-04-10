import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

type Props = {
  user: {
    name: string;
    email: string;
  };
};

export function DashboardTopbar({ user }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <DashboardMobileNav />

        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="truncate text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="max-w-[220px] truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}

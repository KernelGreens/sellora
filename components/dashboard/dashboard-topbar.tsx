import { SignOutButton } from "@/components/dashboard/sign-out-button";

type Props = {
  user: {
    name: string;
    email: string;
  };
};

export function DashboardTopbar({ user }: Props) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <SignOutButton />
      </div>
    </header>
  );
}
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { getServerAuthUser } from "@/lib/auth-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-lg font-semibold tracking-tight">
                KaraCarta Admin
              </Link>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Internal
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              Signed in as {user.name || user.email || "Administrator"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Seller Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

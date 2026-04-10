import Link from "next/link";
import { format } from "date-fns";
import {
  BadgeCheck,
  ExternalLink,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "@/components/dashboard/account-settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerAuthUser } from "@/lib/auth-session";
import { getSellerAccountSettingsData } from "@/lib/services/account.service";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return format(new Date(value), "dd MMM yyyy");
}

function getReadinessItems(
  account: Awaited<ReturnType<typeof getSellerAccountSettingsData>>
) {
  if (!account) {
    return [];
  }

  return [
    {
      label: "Full name is set",
      complete: Boolean(account.fullName),
      detail: account.fullName,
    },
    {
      label: "Primary email is set",
      complete: Boolean(account.email),
      detail: account.email,
    },
    {
      label: "Phone number is added",
      complete: Boolean(account.phone),
      detail:
        account.phone || "Add a phone number to make the profile more complete.",
    },
    {
      label: "Shop is connected",
      complete: Boolean(account.shop),
      detail: account.shop
        ? `${account.shop.name} · ${account.shop.storefrontUrl}`
        : "Complete shop onboarding to launch a storefront.",
    },
  ];
}

export default async function DashboardAccountSettingsPage() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const account = await getSellerAccountSettingsData(user.id);

  if (!account) {
    redirect("/sign-in");
  }

  const readinessItems = getReadinessItems(account);
  const completedReadinessItems = readinessItems.filter(
    (item) => item.complete
  ).length;
  const readinessScore = Math.round(
    (completedReadinessItems / Math.max(readinessItems.length, 1)) * 100
  );
  const accountStatusClassName = account.shop
    ? account.summary.activeStorefront
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700"
    : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Account settings
            </h1>
            <Badge variant="outline" className={accountStatusClassName}>
              {account.shop
                ? account.summary.activeStorefront
                  ? "Storefront connected"
                  : "Shop paused"
                : "Onboarding pending"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Review the seller profile details tied to your dashboard access and
            the storefront account behind your business.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          {account.shop ? (
            <Button asChild>
              <Link href={account.shop.storefrontUrl}>
                View storefront
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/onboarding/shop">Finish onboarding</Link>
            </Button>
          )}

          <Button asChild variant="outline">
            <Link href="/dashboard/settings/shop">Open shop settings</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Seller since</CardDescription>
            <CardTitle className="text-3xl">
              {formatDate(account.createdAt)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Profile completion</CardDescription>
            <CardTitle className="text-3xl">{readinessScore}%</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-3xl">
              {account.summary.totalOrders}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total customers</CardDescription>
            <CardTitle className="text-3xl">
              {account.summary.totalCustomers}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile overview</CardTitle>
              <CardDescription>
                These are the identity details currently attached to your seller
                account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
                  <UserRound className="size-8" />
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-lg font-semibold">{account.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      Signed in as {account.email}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {account.phone
                      ? `Primary phone on file: ${account.phone}`
                      : "No phone number has been added to this account yet."}
                  </p>
                </div>
              </div>

              <Separator />

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Full name</dt>
                  <dd className="text-sm text-muted-foreground">
                    {account.fullName}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Email address</dt>
                  <dd className="text-sm text-muted-foreground">
                    {account.email}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Phone number</dt>
                  <dd className="text-sm text-muted-foreground">
                    {account.phone || "Not added yet"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Last updated</dt>
                  <dd className="text-sm text-muted-foreground">
                    {formatDate(account.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop connection</CardTitle>
              <CardDescription>
                A quick view of how this account currently connects to the
                selling side of Sellora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {account.shop ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl border p-4">
                    <Store className="mt-0.5 size-5 text-sky-600" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{account.shop.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Storefront path: {account.shop.storefrontUrl}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        {account.shop.isActive
                          ? "Ready for customers"
                          : "Connected but currently paused"}
                      </p>
                    </div>
                  </div>

                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <dt className="text-sm font-medium">Shop slug</dt>
                      <dd className="text-sm text-muted-foreground">
                        {account.shop.slug}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-sm font-medium">Shop created</dt>
                      <dd className="text-sm text-muted-foreground">
                        {formatDate(account.shop.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-5">
                  <p className="text-sm font-medium">No shop connected yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your seller account is ready. The next step is to complete
                    shop onboarding so products, customers, and orders can start
                    attaching here.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/onboarding/shop">Start shop onboarding</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile checklist</CardTitle>
              <CardDescription>
                A simple readiness audit for the key profile details this seller
                account depends on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Coverage</p>
                    <p className="text-sm text-muted-foreground">
                      {completedReadinessItems} of {readinessItems.length} core
                      items are in place.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{readinessScore}%</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Ready
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {readinessItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-2xl border p-4"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                        item.complete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      )}
                    >
                      <BadgeCheck className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        <Badge
                          variant="outline"
                          className={
                            item.complete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }
                        >
                          {item.complete ? "Ready" : "Recommended"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access and security</CardTitle>
              <CardDescription>
                This section highlights what your current account details are
                used for across the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Mail className="mt-0.5 size-5 text-sky-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Primary sign-in email</p>
                  <p className="text-sm text-muted-foreground">{account.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Phone className="mt-0.5 size-5 text-emerald-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Phone on file</p>
                  <p className="text-sm text-muted-foreground">
                    {account.phone || "No phone number saved yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <ShieldCheck className="mt-0.5 size-5 text-amber-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Password management</p>
                  <p className="text-sm text-muted-foreground">
                    This slice covers seller profile updates only. Password
                    changes can be added as a follow-up settings feature.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <ShoppingCart className="mt-0.5 size-5 text-violet-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Orders attached</p>
                  <p className="text-sm text-muted-foreground">
                    {account.summary.totalOrders} orders currently roll up under
                    this seller account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Users className="mt-0.5 size-5 text-pink-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Customers captured</p>
                  <p className="text-sm text-muted-foreground">
                    {account.summary.totalCustomers} customers are associated
                    with your current seller footprint.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AccountSettingsForm
        initialValues={{
          fullName: account.fullName,
          email: account.email,
          phone: account.phone || "",
        }}
      />
    </div>
  );
}

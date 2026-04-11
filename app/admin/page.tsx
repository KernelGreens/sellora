import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverviewData } from "@/lib/services/admin.service";

export const metadata: Metadata = {
  title: "Admin | KaraCarta",
  description: "Internal platform overview for KaraCarta operators.",
};

const numberFormatter = new Intl.NumberFormat("en-US");

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export default async function AdminPage() {
  const data = await getAdminOverviewData();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Platform overview</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          This internal surface is intentionally read-only for the first rollout. Use it
          to monitor sellers, storefront activity, and recent order flow before we add any
          privileged write actions.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-3xl">
              {numberFormatter.format(data.summary.totalUsers)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total shops</CardDescription>
            <CardTitle className="text-3xl">
              {numberFormatter.format(data.summary.totalShops)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active shops</CardDescription>
            <CardTitle className="text-3xl">
              {numberFormatter.format(data.summary.activeShops)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Paused shops</CardDescription>
            <CardTitle className="text-3xl">
              {numberFormatter.format(data.summary.inactiveShops)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-3xl">
              {numberFormatter.format(data.summary.totalOrders)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
            <CardDescription>Latest signups across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentUsers.map((user) => (
              <div key={user.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{user.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  {user.isAdmin ? (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Admin
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Joined {formatDate(user.createdAt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.shop
                    ? `Shop: ${user.shop.name} (${user.shop.isActive ? "active" : "paused"})`
                    : "No shop yet"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent shops</CardTitle>
            <CardDescription>Newest storefronts created by sellers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentShops.map((shop) => (
              <div key={shop.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{shop.name}</p>
                    <p className="truncate text-sm text-muted-foreground">/store/{shop.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      shop.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {shop.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Owner: {shop.owner.fullName} ({shop.owner.email})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {formatDate(shop.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest cross-shop order activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {order.shop.name} • {order.customer.name}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {order.orderStatus} • {order.paymentStatus}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {formatDate(order.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

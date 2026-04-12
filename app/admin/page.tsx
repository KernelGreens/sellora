import type { Metadata } from "next";
import Link from "next/link";
import { AdminShopStatusToggle } from "@/components/admin/admin-shop-status-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getOrderStatusMeta,
  ORDER_STATUS_UPDATE_OPTIONS,
} from "@/lib/constants/order-status";
import {
  getPaymentStatusMeta,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/constants/payment-status";
import { getAdminOverviewData } from "@/lib/services/admin.service";
import { adminOrderFiltersSchema } from "@/lib/validations/order";

export const metadata: Metadata = {
  title: "Admin | KaraCarta",
  description: "Internal platform overview for KaraCarta operators.",
};

const numberFormatter = new Intl.NumberFormat("en-US");

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildAdminHref(filters: {
  userQuery: string;
  shopQuery: string;
  orderQuery: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const params = new URLSearchParams();

  if (filters.userQuery) {
    params.set("userQ", filters.userQuery);
  }

  if (filters.shopQuery) {
    params.set("shopQ", filters.shopQuery);
  }

  if (filters.orderQuery) {
    params.set("orderQ", filters.orderQuery);
  }

  if (filters.orderStatus !== "ALL") {
    params.set("orderStatus", filters.orderStatus);
  }

  if (filters.paymentStatus !== "ALL") {
    params.set("paymentStatus", filters.paymentStatus);
  }

  const queryString = params.toString();

  return queryString ? `/admin?${queryString}` : "/admin";
}

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

function getReadinessBadgeClassName(tone: "success" | "warning" | "muted") {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getShopStatusBadgeClassName(isActive: boolean) {
  return isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

type AdminPageProps = {
  searchParams: Promise<{
    userQ?: string | string[];
    shopQ?: string | string[];
    orderQ?: string | string[];
    orderStatus?: string | string[];
    paymentStatus?: string | string[];
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const rawQuery = await searchParams;
  const userQuery = getSearchParamValue(rawQuery.userQ) ?? "";
  const shopQuery = getSearchParamValue(rawQuery.shopQ) ?? "";
  const parsedOrderFilters = adminOrderFiltersSchema.safeParse({
    q: getSearchParamValue(rawQuery.orderQ),
    orderStatus: getSearchParamValue(rawQuery.orderStatus),
    paymentStatus: getSearchParamValue(rawQuery.paymentStatus),
  });
  const orderFilters = parsedOrderFilters.success
    ? parsedOrderFilters.data
    : {};

  const data = await getAdminOverviewData({
    userQuery,
    shopQuery,
    orderQuery: orderFilters.q,
    orderStatus: orderFilters.orderStatus,
    paymentStatus: orderFilters.paymentStatus,
  });

  const hasOrderFilters =
    Boolean(data.filters.orderQuery) ||
    data.filters.orderStatus !== "ALL" ||
    data.filters.paymentStatus !== "ALL";

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Platform overview</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          This internal surface stays read-only for now. Use it to inspect platform health,
          search across sellers, shops, and orders, and spot onboarding gaps before
          enabling any admin write actions.
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

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Search sellers and staff by name or email, then inspect their shop state.
                </CardDescription>
              </div>
              <Badge variant="outline">
                {numberFormatter.format(data.users.totalMatches)} match
                {data.users.totalMatches === 1 ? "" : "es"}
              </Badge>
            </div>

            <form action="/admin" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {data.filters.shopQuery ? (
                <input type="hidden" name="shopQ" value={data.filters.shopQuery} />
              ) : null}
              {data.filters.orderQuery ? (
                <input type="hidden" name="orderQ" value={data.filters.orderQuery} />
              ) : null}
              {data.filters.orderStatus !== "ALL" ? (
                <input type="hidden" name="orderStatus" value={data.filters.orderStatus} />
              ) : null}
              {data.filters.paymentStatus !== "ALL" ? (
                <input type="hidden" name="paymentStatus" value={data.filters.paymentStatus} />
              ) : null}
              <div className="flex-1 space-y-2">
                <Label htmlFor="userQ">Search users</Label>
                <Input
                  id="userQ"
                  name="userQ"
                  defaultValue={data.filters.userQuery}
                  placeholder="Search by seller name or email"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Search</Button>
                <Button asChild type="button" variant="outline">
                  <Link
                    href={buildAdminHref({
                      userQuery: "",
                      shopQuery: data.filters.shopQuery,
                      orderQuery: data.filters.orderQuery,
                      orderStatus: data.filters.orderStatus,
                      paymentStatus: data.filters.paymentStatus,
                    })}
                  >
                    Clear
                  </Link>
                </Button>
              </div>
            </form>
          </CardHeader>

          <CardContent>
            {data.users.items.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No users matched this search yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={user.isAdmin ? "border-primary/20 bg-primary/5 text-primary" : undefined}
                        >
                          {user.isAdmin ? "Admin" : "Seller"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        {user.shop ? (
                          <div className="space-y-1">
                            <p className="font-medium">{user.shop.name}</p>
                            <p className="text-sm text-muted-foreground">/store/{user.shop.slug}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.shop.productCount} product
                              {user.shop.productCount === 1 ? "" : "s"} • {user.shop.isActive ? "Active" : "Paused"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No shop yet</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-2">
                          <Badge variant="outline" className={getReadinessBadgeClassName(user.readiness.tone)}>
                            {user.readiness.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{user.readiness.detail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Shops</CardTitle>
                <CardDescription>
                  Search by shop name or slug to inspect storefront status and launch readiness.
                </CardDescription>
              </div>
              <Badge variant="outline">
                {numberFormatter.format(data.shops.totalMatches)} match
                {data.shops.totalMatches === 1 ? "" : "es"}
              </Badge>
            </div>

            <form action="/admin" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {data.filters.userQuery ? (
                <input type="hidden" name="userQ" value={data.filters.userQuery} />
              ) : null}
              {data.filters.orderQuery ? (
                <input type="hidden" name="orderQ" value={data.filters.orderQuery} />
              ) : null}
              {data.filters.orderStatus !== "ALL" ? (
                <input type="hidden" name="orderStatus" value={data.filters.orderStatus} />
              ) : null}
              {data.filters.paymentStatus !== "ALL" ? (
                <input type="hidden" name="paymentStatus" value={data.filters.paymentStatus} />
              ) : null}
              <div className="flex-1 space-y-2">
                <Label htmlFor="shopQ">Search shops</Label>
                <Input
                  id="shopQ"
                  name="shopQ"
                  defaultValue={data.filters.shopQuery}
                  placeholder="Search by shop name, slug, or owner"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Search</Button>
                <Button asChild type="button" variant="outline">
                  <Link
                    href={buildAdminHref({
                      userQuery: data.filters.userQuery,
                      shopQuery: "",
                      orderQuery: data.filters.orderQuery,
                      orderStatus: data.filters.orderStatus,
                      paymentStatus: data.filters.paymentStatus,
                    })}
                  >
                    Clear
                  </Link>
                </Button>
              </div>
            </form>
          </CardHeader>

          <CardContent>
            {data.shops.items.length === 0 ? (
              <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                No shops matched this search yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Readiness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.shops.items.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-muted-foreground">/store/{shop.slug}</p>
                          <Link href={`/store/${shop.slug}`} className="text-xs text-primary hover:underline">
                            Open storefront
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{shop.owner.fullName}</p>
                          <p className="text-sm text-muted-foreground">{shop.owner.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getShopStatusBadgeClassName(shop.isActive)}>
                          {shop.isActive ? "Active" : "Paused"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <AdminShopStatusToggle
                          shopId={shop.id}
                          shopName={shop.name}
                          isActive={shop.isActive}
                        />
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{shop.metrics.products} product{shop.metrics.products === 1 ? "" : "s"}</p>
                          <p>{shop.metrics.orders} order{shop.metrics.orders === 1 ? "" : "s"}</p>
                          <p>{shop.metrics.customers} customer{shop.metrics.customers === 1 ? "" : "s"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-2">
                          <Badge variant="outline" className={getReadinessBadgeClassName(shop.readiness.tone)}>
                            {shop.readiness.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{shop.readiness.detail}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Search across all shops by order number, customer, phone, product, or storefront.
              </CardDescription>
            </div>
            <Badge variant="outline">
              {numberFormatter.format(data.orders.totalMatches)} match
              {data.orders.totalMatches === 1 ? "" : "es"}
            </Badge>
          </div>

          <form
            action="/admin"
            method="get"
            className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,220px)_minmax(0,220px)_auto_auto] lg:items-end"
          >
            {data.filters.userQuery ? (
              <input type="hidden" name="userQ" value={data.filters.userQuery} />
            ) : null}
            {data.filters.shopQuery ? (
              <input type="hidden" name="shopQ" value={data.filters.shopQuery} />
            ) : null}

            <div>
              <Label htmlFor="orderQ">Search orders</Label>
              <Input
                id="orderQ"
                name="orderQ"
                defaultValue={data.filters.orderQuery}
                placeholder="Order number, customer, phone, product, or shop"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="orderStatus">Order status</Label>
              <NativeSelect
                id="orderStatus"
                name="orderStatus"
                defaultValue={data.filters.orderStatus}
                className="mt-1.5 w-full"
              >
                <NativeSelectOption value="ALL">All order statuses</NativeSelectOption>
                {ORDER_STATUS_UPDATE_OPTIONS.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {getOrderStatusMeta(status).label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label htmlFor="paymentStatus">Payment status</Label>
              <NativeSelect
                id="paymentStatus"
                name="paymentStatus"
                defaultValue={data.filters.paymentStatus}
                className="mt-1.5 w-full"
              >
                <NativeSelectOption value="ALL">All payment statuses</NativeSelectOption>
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <NativeSelectOption key={status} value={status}>
                    {getPaymentStatusMeta(status).label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <Button type="submit">Apply filters</Button>

            <Button asChild variant="outline">
              <Link
                href={buildAdminHref({
                  userQuery: data.filters.userQuery,
                  shopQuery: data.filters.shopQuery,
                  orderQuery: "",
                  orderStatus: "ALL",
                  paymentStatus: "ALL",
                })}
              >
                Clear
              </Link>
            </Button>
          </form>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing up to {data.orders.pageSize} of {numberFormatter.format(data.orders.totalMatches)}
              {" "}matching order{data.orders.totalMatches === 1 ? "" : "s"}.
            </p>
            {hasOrderFilters ? (
              <p>Filtered platform order view is active.</p>
            ) : (
              <p>Most recent platform orders appear first.</p>
            )}
          </div>

          {data.orders.items.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              No orders matched these filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.orders.items.map((order) => {
                  const orderStatusMeta = getOrderStatusMeta(order.orderStatus as typeof ORDER_STATUS_UPDATE_OPTIONS[number]);
                  const paymentStatusMeta = getPaymentStatusMeta(order.paymentStatus as typeof PAYMENT_STATUS_OPTIONS[number]);

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{order.shop.name}</p>
                          <p className="text-sm text-muted-foreground">/store/{order.shop.slug}</p>
                          <Badge variant="outline" className={getShopStatusBadgeClassName(order.shop.isActive)}>
                            {order.shop.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {order.items.map((item) => (
                            <p key={`${order.id}-${item.productNameSnapshot}`}>
                              {item.productNameSnapshot} x{item.quantity}
                            </p>
                          ))}
                          {order.itemCount > order.items.length ? (
                            <p className="text-xs">+{order.itemCount - order.items.length} more item(s)</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-2">
                          <Badge variant="outline" className={orderStatusMeta.className}>
                            {orderStatusMeta.label}
                          </Badge>
                          <Badge variant="outline" className={paymentStatusMeta.className}>
                            {paymentStatusMeta.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

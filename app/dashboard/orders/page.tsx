import Link from "next/link";
import { format } from "date-fns";
import { PackageSearch, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerAuthUser } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_UPDATE_OPTIONS,
  getOrderStatusMeta,
} from "@/lib/constants/order-status";
import {
  getPaymentStatusMeta,
  PAYMENT_STATUS_OPTIONS,
} from "@/lib/constants/payment-status";
import { getSellerOrderListData } from "@/lib/services/order.service";
import { formatNaira } from "@/lib/utils/currency";
import { sellerOrderHistoryFiltersSchema } from "@/lib/validations/order";

function formatOrderDate(isoDate: string) {
  return format(new Date(isoDate), "dd MMM yyyy, h:mm a");
}

type DashboardOrdersPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    orderStatus?: string | string[];
    paymentStatus?: string | string[];
    page?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildOrdersPageHref(filters: {
  query: string;
  orderStatus: string;
  paymentStatus: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.orderStatus !== "ALL") {
    params.set("orderStatus", filters.orderStatus);
  }

  if (filters.paymentStatus !== "ALL") {
    params.set("paymentStatus", filters.paymentStatus);
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const queryString = params.toString();

  return queryString ? `/dashboard/orders?${queryString}` : "/dashboard/orders";
}

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, null, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, null, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages];
}

export default async function DashboardOrdersPage({
  searchParams,
}: DashboardOrdersPageProps) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const rawQuery = await searchParams;
  const parsedFilters = sellerOrderHistoryFiltersSchema.safeParse({
    q: getSearchParamValue(rawQuery.q),
    orderStatus: getSearchParamValue(rawQuery.orderStatus),
    paymentStatus: getSearchParamValue(rawQuery.paymentStatus),
    page: getSearchParamValue(rawQuery.page),
  });
  const filtersInput = parsedFilters.success ? parsedFilters.data : {};
  const orderListData = await getSellerOrderListData(user.id, filtersInput);

  if (!orderListData) {
    redirect("/onboarding/shop");
  }

  const { orders, summary, shopName, filters, pagination } = orderListData;
  const hasActiveFilters =
    Boolean(filters.query) ||
    filters.orderStatus !== "ALL" ||
    filters.paymentStatus !== "ALL";
  const paginationItems = getPaginationItems(
    pagination.page,
    pagination.totalPages
  );
  const currentRangeStart =
    pagination.totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const currentRangeEnd =
    pagination.totalItems === 0
      ? 0
      : currentRangeStart + orders.length - 1;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track incoming orders for {shopName}, monitor payment progress, and
          keep the handoff from storefront to fulfillment visible in one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-3xl">{summary.totalOrders}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>New orders</CardDescription>
            <CardTitle className="text-3xl">{summary.newOrders}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Pending payment</CardDescription>
            <CardTitle className="text-3xl">
              {summary.awaitingPaymentOrders}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Collected revenue</CardDescription>
            <CardTitle className="text-3xl">
              {formatNaira(summary.collectedRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Order history</CardTitle>
          <CardDescription>
            Search by order reference, customer, phone number, or product name.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <form method="get" className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,220px)_minmax(0,220px)_auto_auto] lg:items-end">
            <input type="hidden" name="page" value="1" />

            <div>
              <Label htmlFor="q">Search</Label>
              <Input
                id="q"
                name="q"
                defaultValue={filters.query}
                placeholder="Order number, customer, phone, or product"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="orderStatus">Order status</Label>
              <NativeSelect
                id="orderStatus"
                name="orderStatus"
                defaultValue={filters.orderStatus}
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
                defaultValue={filters.paymentStatus}
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
              <Link href="/dashboard/orders">Clear</Link>
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {currentRangeStart}-{currentRangeEnd} of {pagination.totalItems}{" "}
              order{pagination.totalItems === 1 ? "" : "s"}.
            </p>
            {hasActiveFilters ? (
              <p>Filtered history view is active.</p>
            ) : (
              <p>Most recent orders appear first.</p>
            )}
          </div>

          {orders.length === 0 ? (
            hasActiveFilters ? (
              <Empty className="rounded-2xl border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageSearch className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No matching orders</EmptyTitle>
                  <EmptyDescription>
                    Try a different search term or clear your filters to see the full
                    order history again.
                  </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                  <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Clear filters
                  </Link>
                </EmptyContent>
              </Empty>
            ) : (
              <Empty className="rounded-2xl border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageSearch className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>No orders yet</EmptyTitle>
                  <EmptyDescription>
                    Orders from your storefront checkout will appear here as soon
                    as customers start placing them.
                  </EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                  <Link
                    href="/onboarding/products"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <ShoppingBag className="mr-2 size-4" />
                    Add products
                  </Link>
                </EmptyContent>
              </Empty>
            )
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const orderStatus = getOrderStatusMeta(order.orderStatus);
                      const paymentStatus = getPaymentStatusMeta(order.paymentStatus);

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <Link
                                href={`/dashboard/orders/${order.id}`}
                                className="font-medium transition-colors hover:text-primary"
                              >
                                {order.orderNumber}
                              </Link>
                              <p className="max-w-56 text-sm text-muted-foreground">
                                {order.productSummary}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="space-y-1">
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.customerPhone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-muted-foreground">
                            {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                          </TableCell>
                          <TableCell className="align-top font-medium">
                            {formatNaira(order.totalAmount)}
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge
                              variant="outline"
                              className={paymentStatus.className}
                            >
                              {paymentStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className={orderStatus.className}>
                              {orderStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-top text-muted-foreground">
                            {formatOrderDate(order.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 ? (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={buildOrdersPageHref({
                          query: filters.query,
                          orderStatus: filters.orderStatus,
                          paymentStatus: filters.paymentStatus,
                          page: Math.max(1, pagination.page - 1),
                        })}
                        aria-disabled={!pagination.hasPreviousPage}
                        className={
                          pagination.hasPreviousPage
                            ? undefined
                            : "pointer-events-none opacity-50"
                        }
                      />
                    </PaginationItem>

                    {paginationItems.map((pageItem, index) => (
                      <PaginationItem key={`${pageItem ?? "ellipsis"}-${index}`}>
                        {pageItem === null ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href={buildOrdersPageHref({
                              query: filters.query,
                              orderStatus: filters.orderStatus,
                              paymentStatus: filters.paymentStatus,
                              page: pageItem,
                            })}
                            isActive={pageItem === pagination.page}
                          >
                            {pageItem}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href={buildOrdersPageHref({
                          query: filters.query,
                          orderStatus: filters.orderStatus,
                          paymentStatus: filters.paymentStatus,
                          page: Math.min(pagination.totalPages, pagination.page + 1),
                        })}
                        aria-disabled={!pagination.hasNextPage}
                        className={
                          pagination.hasNextPage
                            ? undefined
                            : "pointer-events-none opacity-50"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

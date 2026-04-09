import Link from "next/link";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getSellerCustomerListData } from "@/lib/services/customer.service";
import { formatNaira } from "@/lib/utils/currency";
import {
  sellerCustomerListFiltersSchema,
  sellerCustomerRelationshipFilterOptions,
} from "@/lib/validations/customer";

function formatCustomerDate(isoDate: string) {
  return format(new Date(isoDate), "dd MMM yyyy");
}

function formatCustomerDateTime(isoDate: string) {
  return format(new Date(isoDate), "dd MMM yyyy, h:mm a");
}

type DashboardCustomersPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    relationship?: string | string[];
    page?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCustomersPageHref(filters: {
  query: string;
  relationship: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.relationship !== "ALL") {
    params.set("relationship", filters.relationship);
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const queryString = params.toString();

  return queryString
    ? `/dashboard/customers?${queryString}`
    : "/dashboard/customers";
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

function getRelationshipMeta(relationship: "NEW" | "REPEAT") {
  if (relationship === "REPEAT") {
    return {
      label: "Repeat customer",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "First-time customer",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  };
}

export default async function DashboardCustomersPage({
  searchParams,
}: DashboardCustomersPageProps) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const rawQuery = await searchParams;
  const parsedFilters = sellerCustomerListFiltersSchema.safeParse({
    q: getSearchParamValue(rawQuery.q),
    relationship: getSearchParamValue(rawQuery.relationship),
    page: getSearchParamValue(rawQuery.page),
  });
  const filtersInput = parsedFilters.success ? parsedFilters.data : {};
  const customerListData = await getSellerCustomerListData(user.id, filtersInput);

  if (!customerListData) {
    redirect("/onboarding/shop");
  }

  const { customers, summary, shopName, shopSlug, filters, pagination } =
    customerListData;
  const hasActiveFilters =
    Boolean(filters.query) || filters.relationship !== "ALL";
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
      : currentRangeStart + customers.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            See who is ordering from {shopName}, spot repeat buyers, and keep
            the customer side of fulfillment visible in one dashboard.
          </p>
        </section>

        <Button asChild variant="outline">
          <Link href={`/store/${shopSlug}`}>View storefront</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total customers</CardDescription>
            <CardTitle className="text-3xl">{summary.totalCustomers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>First-time customers</CardDescription>
            <CardTitle className="text-3xl">
              {summary.firstTimeCustomers}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Repeat customers</CardDescription>
            <CardTitle className="text-3xl">{summary.repeatCustomers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Added this month</CardDescription>
            <CardTitle className="text-3xl">
              {summary.customersAddedThisMonth}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Customer list</CardTitle>
          <CardDescription>
            Search by customer name, phone number, or email and segment by
            first-time vs repeat buyers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <form
            method="get"
            className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,220px)_auto_auto] lg:items-end"
          >
            <input type="hidden" name="page" value="1" />

            <div>
              <Label htmlFor="q">Search</Label>
              <Input
                id="q"
                name="q"
                defaultValue={filters.query}
                placeholder="Customer name, phone, or email"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <NativeSelect
                id="relationship"
                name="relationship"
                defaultValue={filters.relationship}
                className="mt-1.5"
              >
                {sellerCustomerRelationshipFilterOptions.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {option === "ALL"
                      ? "All customers"
                      : option === "NEW"
                        ? "First-time customers"
                        : "Repeat customers"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <Button type="submit">Apply filters</Button>

            <Button asChild variant="outline">
              <Link href="/dashboard/customers">Clear</Link>
            </Button>
          </form>

          {customers.length === 0 ? (
            <Empty className="border border-dashed bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>
                  {hasActiveFilters ? "No matching customers" : "No customers yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try a different search term or reset the relationship filter to see the full customer list again."
                    : "Customer records will appear here automatically once people start placing orders from your storefront."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="sm:flex-row sm:justify-center">
                {hasActiveFilters ? (
                  <Button asChild variant="outline">
                    <Link href="/dashboard/customers">Reset filters</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/store/${shopSlug}`}>Share storefront</Link>
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Collected</TableHead>
                      <TableHead>Latest order</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => {
                      const relationship = getRelationshipMeta(
                        customer.relationship
                      );

                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="min-w-[260px]">
                            <div className="space-y-1">
                              <Link
                                href={`/dashboard/customers/${customer.id}`}
                                className="font-medium hover:underline"
                              >
                                {customer.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {customer.phone}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {customer.email || "No email provided"}
                              </p>
                              <Link
                                href={`/dashboard/customers/${customer.id}`}
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                View order history
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={relationship.className}
                            >
                              {relationship.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{customer.orderCount}</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.paidOrderCount} paid orders
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatNaira(customer.totalSpent)}
                          </TableCell>
                          <TableCell>
                            {customer.latestOrderId && customer.latestOrderNumber ? (
                              <div className="space-y-1">
                                <Link
                                  href={`/dashboard/orders/${customer.latestOrderId}`}
                                  className="font-medium hover:underline"
                                >
                                  {customer.latestOrderNumber}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                  {customer.lastOrderAt
                                    ? formatCustomerDateTime(customer.lastOrderAt)
                                    : "No order yet"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No order yet
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatCustomerDate(customer.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 ? (
                <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {currentRangeStart}-{currentRangeEnd} of{" "}
                    {pagination.totalItems} customers
                  </p>

                  <Pagination className="justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={
                            pagination.hasPreviousPage
                              ? buildCustomersPageHref({
                                  query: filters.query,
                                  relationship: filters.relationship,
                                  page: pagination.page - 1,
                                })
                              : "#"
                          }
                          aria-disabled={!pagination.hasPreviousPage}
                          className={
                            pagination.hasPreviousPage
                              ? undefined
                              : "pointer-events-none opacity-50"
                          }
                        />
                      </PaginationItem>

                      {paginationItems.map((item, index) =>
                        item === null ? (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={item}>
                            <PaginationLink
                              href={buildCustomersPageHref({
                                query: filters.query,
                                relationship: filters.relationship,
                                page: item,
                              })}
                              isActive={item === pagination.page}
                            >
                              {item}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href={
                            pagination.hasNextPage
                              ? buildCustomersPageHref({
                                  query: filters.query,
                                  relationship: filters.relationship,
                                  page: pagination.page + 1,
                                })
                              : "#"
                          }
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
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { format } from "date-fns";
import { PackageSearch } from "lucide-react";
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
import { getSellerProductListData } from "@/lib/services/product.service";
import { formatNaira } from "@/lib/utils/currency";
import {
  sellerProductListFiltersSchema,
  sellerProductStockFilterOptions,
  sellerProductVisibilityFilterOptions,
} from "@/lib/validations/product";

function formatProductDate(isoDate: string) {
  return format(new Date(isoDate), "dd MMM yyyy");
}

type DashboardProductsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    visibility?: string | string[];
    stockStatus?: string | string[];
    page?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildProductsPageHref(filters: {
  query: string;
  visibility: string;
  stockStatus: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.visibility !== "ALL") {
    params.set("visibility", filters.visibility);
  }

  if (filters.stockStatus !== "ALL") {
    params.set("stockStatus", filters.stockStatus);
  }

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const queryString = params.toString();

  return queryString
    ? `/dashboard/products?${queryString}`
    : "/dashboard/products";
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

function getVisibilityMeta(isActive: boolean) {
  if (isActive) {
    return {
      label: "Active",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: "Hidden",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

function getStockMeta(stockState: "HEALTHY" | "LOW" | "OUT" | "UNTRACKED") {
  switch (stockState) {
    case "HEALTHY":
      return {
        label: "Healthy stock",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "LOW":
      return {
        label: "Low stock",
        className: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "OUT":
      return {
        label: "Out of stock",
        className: "border-red-200 bg-red-50 text-red-700",
      };
    default:
      return {
        label: "Untracked",
        className: "border-slate-200 bg-slate-50 text-slate-700",
      };
  }
}

function getStockDetail(
  stockQuantity: number | null,
  stockState: "HEALTHY" | "LOW" | "OUT" | "UNTRACKED"
) {
  if (stockState === "UNTRACKED") {
    return "Inventory tracking not set";
  }

  if (stockState === "OUT") {
    return "0 units left";
  }

  return `${stockQuantity ?? 0} units left`;
}

export default async function DashboardProductsPage({
  searchParams,
}: DashboardProductsPageProps) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const rawQuery = await searchParams;
  const parsedFilters = sellerProductListFiltersSchema.safeParse({
    q: getSearchParamValue(rawQuery.q),
    visibility: getSearchParamValue(rawQuery.visibility),
    stockStatus: getSearchParamValue(rawQuery.stockStatus),
    page: getSearchParamValue(rawQuery.page),
  });
  const filtersInput = parsedFilters.success ? parsedFilters.data : {};
  const productListData = await getSellerProductListData(user.id, filtersInput);

  if (!productListData) {
    redirect("/onboarding/shop");
  }

  const { products, summary, shopName, shopSlug, filters, pagination } =
    productListData;
  const hasActiveFilters =
    Boolean(filters.query) ||
    filters.visibility !== "ALL" ||
    filters.stockStatus !== "ALL";
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
      : currentRangeStart + products.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Monitor the catalog for {shopName}, track what is visible in the
            storefront, and catch stock issues before they affect orders.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/products/new">Add product</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/store/${shopSlug}`}>View storefront</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader>
            <CardDescription>Total products</CardDescription>
            <CardTitle className="text-3xl">{summary.totalProducts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active listings</CardDescription>
            <CardTitle className="text-3xl">{summary.activeProducts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Hidden listings</CardDescription>
            <CardTitle className="text-3xl">{summary.hiddenProducts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Low stock</CardDescription>
            <CardTitle className="text-3xl">{summary.lowStockProducts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Out of stock</CardDescription>
            <CardTitle className="text-3xl">
              {summary.outOfStockProducts}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Catalog overview</CardTitle>
          <CardDescription>
            Search your current listings by product name or description and
            review visibility and stock health in one place.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <form
            method="get"
            className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,220px)_minmax(0,220px)_auto_auto] lg:items-end"
          >
            <input type="hidden" name="page" value="1" />

            <div>
              <Label htmlFor="q">Search</Label>
              <Input
                id="q"
                name="q"
                placeholder="Product name or description"
                defaultValue={filters.query}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <NativeSelect
                id="visibility"
                name="visibility"
                defaultValue={filters.visibility}
                className="mt-1.5"
              >
                {sellerProductVisibilityFilterOptions.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {option === "ALL"
                      ? "All listings"
                      : option === "ACTIVE"
                        ? "Active"
                        : "Hidden"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label htmlFor="stockStatus">Stock</Label>
              <NativeSelect
                id="stockStatus"
                name="stockStatus"
                defaultValue={filters.stockStatus}
                className="mt-1.5"
              >
                {sellerProductStockFilterOptions.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {option === "ALL"
                      ? "All stock states"
                      : option === "HEALTHY"
                        ? "Healthy stock"
                        : option === "LOW"
                          ? "Low stock"
                          : option === "OUT"
                            ? "Out of stock"
                            : "Untracked"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <Button type="submit">Apply filters</Button>

            <Button asChild variant="outline">
              <Link href="/dashboard/products">Clear</Link>
            </Button>
          </form>

          {products.length === 0 ? (
            <Empty className="border border-dashed bg-muted/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageSearch />
                </EmptyMedia>
                <EmptyTitle>
                  {hasActiveFilters ? "No matching products" : "No products yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try a different search term or reset the filters to see the full catalog again."
                    : "Add your first products during onboarding so your storefront has something customers can browse and order."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="sm:flex-row sm:justify-center">
                {hasActiveFilters ? (
                  <Button asChild variant="outline">
                    <Link href="/dashboard/products">Reset filters</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/dashboard/products/new">Add first product</Link>
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
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead>Order usage</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const visibility = getVisibilityMeta(product.isActive);
                      const stock = getStockMeta(product.stockState);

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="min-w-[280px]">
                            <div className="flex items-start gap-3">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="size-14 rounded-lg border object-cover"
                                />
                              ) : (
                                <div className="flex size-14 items-center justify-center rounded-lg border bg-muted text-sm font-medium text-muted-foreground">
                                  {product.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}

                              <div className="space-y-1">
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="font-medium hover:underline"
                                >
                                  {product.name}
                                </Link>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                  {product.description || "No description added yet."}
                                </p>
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  Edit listing
                                </Link>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatNaira(product.price)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={visibility.className}>
                              {visibility.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className={stock.className}>
                                {stock.label}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {getStockDetail(
                                  product.stockQuantity,
                                  product.stockState
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{product.orderCount}</p>
                              <p className="text-xs text-muted-foreground">
                                Order lines referencing this product
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatProductDate(product.updatedAt)}
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
                    {pagination.totalItems} products
                  </p>

                  <Pagination className="justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={
                            pagination.hasPreviousPage
                              ? buildProductsPageHref({
                                  query: filters.query,
                                  visibility: filters.visibility,
                                  stockStatus: filters.stockStatus,
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
                              href={buildProductsPageHref({
                                query: filters.query,
                                visibility: filters.visibility,
                                stockStatus: filters.stockStatus,
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
                              ? buildProductsPageHref({
                                  query: filters.query,
                                  visibility: filters.visibility,
                                  stockStatus: filters.stockStatus,
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

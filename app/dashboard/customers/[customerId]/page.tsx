import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Mail, Phone, ReceiptText, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerAuthUser } from "@/lib/auth-session";
import { getOrderStatusMeta } from "@/lib/constants/order-status";
import { getPaymentStatusMeta } from "@/lib/constants/payment-status";
import { getSellerCustomerDetailData } from "@/lib/services/customer.service";
import { formatNaira } from "@/lib/utils/currency";

type DashboardCustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

function formatDateTime(value: string) {
  return format(new Date(value), "dd MMM yyyy, h:mm a");
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

export default async function DashboardCustomerDetailPage({
  params,
}: DashboardCustomerDetailPageProps) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { customerId } = await params;
  const customer = await getSellerCustomerDetailData(user.id, customerId);

  if (!customer) {
    notFound();
  }

  const relationship = getRelationshipMeta(customer.relationship);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/customers">Customers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{customer.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="w-fit px-0">
              <Link href="/dashboard/customers">
                <ArrowLeft className="size-4" />
                Back to customers
              </Link>
            </Button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {customer.name}
                </h1>
                <Badge variant="outline" className={relationship.className}>
                  {relationship.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Customer since {formatDateTime(customer.createdAt)} for{" "}
                {customer.shopName}.
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            <Card size="sm">
              <CardHeader>
                <CardDescription>Total orders</CardDescription>
                <CardTitle className="text-xl">{customer.orderCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardDescription>Paid orders</CardDescription>
                <CardTitle className="text-xl">
                  {customer.paidOrderCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardDescription>Collected revenue</CardDescription>
                <CardTitle className="text-xl">
                  {formatNaira(customer.totalSpent)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card className="gap-0">
            <CardHeader className="border-b">
              <CardTitle>Order history</CardTitle>
              <CardDescription>
                Every order this customer has placed with {customer.shopName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {customer.orders.length === 0 ? (
                <Empty className="rounded-none border-0 py-12">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ReceiptText />
                    </EmptyMedia>
                    <EmptyTitle>No orders yet</EmptyTitle>
                    <EmptyDescription>
                      This customer record exists, but no orders have been saved for
                      them yet.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild variant="outline">
                      <Link href="/dashboard/customers">Back to customers</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Placed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => {
                      const orderStatus = getOrderStatusMeta(order.orderStatus);
                      const paymentStatus = getPaymentStatusMeta(order.paymentStatus);

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="min-w-[240px]">
                            <div className="space-y-1">
                              <Link
                                href={`/dashboard/orders/${order.id}`}
                                className="font-medium hover:underline"
                              >
                                {order.orderNumber}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {order.productSummary}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.customerNote || "No customer note provided"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={orderStatus.className}
                            >
                              {orderStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={paymentStatus.className}
                            >
                              {paymentStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.itemCount}</TableCell>
                          <TableCell className="font-medium">
                            {formatNaira(order.totalAmount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer details</CardTitle>
              <CardDescription>
                Contact and lifecycle details for this customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Full name</p>
                <p className="text-sm text-muted-foreground">{customer.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Phone number</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Email address</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  <span>{customer.email || "No email provided"}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Last order</p>
                <p className="text-sm text-muted-foreground">
                  {customer.latestOrderAt
                    ? formatDateTime(customer.latestOrderAt)
                    : "No order yet"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Profile updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(customer.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick context</CardTitle>
              <CardDescription>
                Snapshot of how this customer relates to current operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Relationship</p>
                  <p className="text-sm text-muted-foreground">
                    {relationship.label}
                  </p>
                </div>
                <Users className="size-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Paid conversion</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.orderCount === 0
                      ? "No orders yet"
                      : `${customer.paidOrderCount} of ${customer.orderCount} orders paid`}
                  </p>
                </div>
                <ReceiptText className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

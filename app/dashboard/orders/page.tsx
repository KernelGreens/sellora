import Link from "next/link";
import { format } from "date-fns";
import { PackageSearch, ShoppingBag } from "lucide-react";
import { getServerSession } from "next-auth";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authOptions } from "@/lib/auth";
import { getOrderStatusMeta } from "@/lib/constants/order-status";
import { getPaymentStatusMeta } from "@/lib/constants/payment-status";
import { getSellerOrderListData } from "@/lib/services/order.service";
import { formatNaira } from "@/lib/utils/currency";

function formatOrderDate(isoDate: string) {
  return format(new Date(isoDate), "dd MMM yyyy, h:mm a");
}

export default async function DashboardOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const orderListData = await getSellerOrderListData(session.user.id);

  if (!orderListData) {
    redirect("/onboarding/shop");
  }

  const { orders, summary, shopName } = orderListData;

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
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>
            Every order created before the WhatsApp handoff appears here.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {orders.length === 0 ? (
            <Empty className="rounded-none border-0">
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
          ) : (
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
                          <p className="font-medium">{order.orderNumber}</p>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

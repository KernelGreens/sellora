import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Copy, MapPin, Package, Phone, ReceiptText } from "lucide-react";
import { getServerSession } from "next-auth";
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
import { Separator } from "@/components/ui/separator";
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
import { getSellerOrderDetailData } from "@/lib/services/order.service";
import { formatNaira } from "@/lib/utils/currency";

type OrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function formatDateTime(value: string) {
  return format(new Date(value), "dd MMM yyyy, h:mm a");
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { orderId } = await params;
  const order = await getSellerOrderDetailData(session.user.id, orderId);

  if (!order) {
    notFound();
  }

  const orderStatus = getOrderStatusMeta(order.orderStatus);
  const paymentStatus = getPaymentStatusMeta(order.paymentStatus);

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
                <Link href="/dashboard/orders">Orders</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{order.orderNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="ghost" size="sm" className="w-fit px-0">
              <Link href="/dashboard/orders">
                <ArrowLeft className="size-4" />
                Back to orders
              </Link>
            </Button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {order.orderNumber}
                </h1>
                <Badge variant="outline" className={orderStatus.className}>
                  {orderStatus.label}
                </Badge>
                <Badge variant="outline" className={paymentStatus.className}>
                  {paymentStatus.label}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Order placed on {formatDateTime(order.createdAt)} for {order.shopName}.
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            <Card size="sm">
              <CardHeader>
                <CardDescription>Total amount</CardDescription>
                <CardTitle className="text-xl">
                  {formatNaira(order.totalAmount)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardDescription>Items ordered</CardDescription>
                <CardTitle className="text-xl">{order.itemCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardDescription>Last updated</CardDescription>
                <CardTitle className="text-base">
                  {formatDateTime(order.updatedAt)}
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
              <CardTitle>Order items</CardTitle>
              <CardDescription>
                Snapshot of what the customer selected at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{formatNaira(item.unitPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-medium">
                        {formatNaira(item.lineTotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order totals</CardTitle>
              <CardDescription>
                Current financial breakdown for this order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-medium">
                  {order.deliveryFee === null
                    ? "Not set"
                    : formatNaira(order.deliveryFee)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Total</span>
                <span className="text-lg font-semibold">
                  {formatNaira(order.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
              <CardDescription>
                Timeline of changes recorded for this order so far.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.statusLogs.map((log) => {
                const nextStatus = getOrderStatusMeta(log.newStatus);
                const previousStatus = log.oldStatus
                  ? getOrderStatusMeta(log.oldStatus)
                  : null;

                return (
                  <div
                    key={log.id}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {previousStatus ? (
                            <>
                              <Badge variant="outline" className={previousStatus.className}>
                                {previousStatus.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">to</span>
                            </>
                          ) : null}
                          <Badge variant="outline" className={nextStatus.className}>
                            {nextStatus.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.note || "No note was added for this update."}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(log.changedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>
                Contact details captured during checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  Customer since {formatDateTime(order.customer.createdAt)}
                </p>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p>{order.customer.phone}</p>
                    {order.customer.email ? (
                      <p className="text-muted-foreground">{order.customer.email}</p>
                    ) : (
                      <p className="text-muted-foreground">No email provided</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery details</CardTitle>
              <CardDescription>
                Fulfillment information captured before the WhatsApp handoff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                <p className="leading-6">{order.deliveryAddress}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-medium">Customer note</p>
                <p className="leading-6 text-muted-foreground">
                  {order.customerNote || "No customer note was provided."}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Internal note</p>
                <p className="leading-6 text-muted-foreground">
                  {order.internalNote || "No internal note has been added yet."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment details</CardTitle>
              <CardDescription>
                Information currently stored for payment verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <ReceiptText className="mt-0.5 size-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Reference</p>
                  <p className="text-muted-foreground">
                    {order.paymentReference || "No payment reference recorded."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Copy className="mt-0.5 size-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Proof of payment</p>
                  {order.paymentProofUrl ? (
                    <Link
                      href={order.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      View uploaded proof
                    </Link>
                  ) : (
                    <p className="text-muted-foreground">
                      No proof of payment uploaded.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order metadata</CardTitle>
              <CardDescription>
                Useful reference details for support and fulfillment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 size-4 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">Order ID</p>
                  <p className="break-all text-muted-foreground">{order.id}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground">
                Last updated {formatDateTime(order.updatedAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  buildStorefrontOrderWhatsAppUrl,
  formatNairaFromKobo,
} from "@/lib/services/whatsapp.service";

type StorefrontSuccessPageProps = {
  params: Promise<{ slug: string; orderId: string }>;
};

function toKobo(value: number) {
  return Math.round(value * 100);
}

export default async function StorefrontSuccessPage({
  params,
}: StorefrontSuccessPageProps) {
  const { slug, orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      shop: {
        slug,
      },
    },
    select: {
      id: true,
      orderNumber: true,
      deliveryAddress: true,
      customerNote: true,
      totalAmount: true,
      createdAt: true,
      customer: {
        select: {
          name: true,
          phone: true,
        },
      },
      shop: {
        select: {
          slug: true,
          name: true,
          whatsappNumber: true,
        },
      },
      items: {
        select: {
          productNameSnapshot: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const whatsappUrl = buildStorefrontOrderWhatsAppUrl({
    shopName: order.shop.name,
    whatsappNumber: order.shop.whatsappNumber,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    deliveryAddress: order.deliveryAddress,
    orderNumber: order.orderNumber,
    customerNote: order.customerNote,
    subtotalKobo: toKobo(Number(order.totalAmount)),
    items: order.items.map((item) => ({
      name: item.productNameSnapshot,
      quantity: item.quantity,
      unitPriceKobo: toKobo(Number(item.unitPrice)),
      lineTotalKobo: toKobo(Number(item.lineTotal)),
    })),
  });

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-green-700">Order saved successfully</p>
          <h1 className="mt-3 text-3xl font-semibold">Send your order on WhatsApp</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your order has been recorded with KaraCarta. Send the prepared WhatsApp message so the seller can confirm availability and payment.
          </p>

          <div className="mt-6 rounded-2xl border bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground">Order reference</p>
            <p className="mt-1 text-xl font-semibold">{order.orderNumber}</p>

            <div className="mt-4 space-y-3 text-sm">
              {order.items.map((item) => (
                <div
                  key={`${item.productNameSnapshot}-${item.quantity}`}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="font-medium">{item.productNameSnapshot}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {formatNairaFromKobo(toKobo(Number(item.lineTotal)))}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">
                {formatNairaFromKobo(toKobo(Number(order.totalAmount)))}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="sm:flex-1">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Open WhatsApp
              </a>
            </Button>

            <Button asChild variant="outline" size="lg" className="sm:flex-1">
              <Link href={`/store/${order.shop.slug}`}>Back to store</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Delivery or pickup: {order.deliveryAddress}
          </p>
          {order.customerNote ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Note: {order.customerNote}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

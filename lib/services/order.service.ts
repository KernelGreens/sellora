import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { CreateStorefrontOrderInput } from "@/lib/validations/order";
import type { SellerOrderListData, SellerOrderListItem } from "@/types/order";
import {
  buildStorefrontOrderWhatsAppUrl,
  normalizePhoneNumber,
} from "@/lib/services/whatsapp.service";

export class OrderServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "OrderServiceError";
    this.statusCode = statusCode;
  }
}

type CreateStorefrontOrderParams = {
  shopSlug: string;
  input: CreateStorefrontOrderInput;
};

function serializeSellerOrderListItem(order: {
  id: string;
  orderNumber: string;
  createdAt: Date;
  totalAmount: { toString(): string };
  orderStatus: SellerOrderListItem["orderStatus"];
  paymentStatus: SellerOrderListItem["paymentStatus"];
  customer: {
    name: string;
    phone: string;
  };
  items: Array<{
    productNameSnapshot: string;
    quantity: number;
  }>;
}): SellerOrderListItem {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const firstItem = order.items[0];
  const extraProductsCount = Math.max(order.items.length - 1, 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    itemCount,
    productSummary: firstItem
      ? extraProductsCount > 0
        ? `${firstItem.productNameSnapshot} +${extraProductsCount} more`
        : firstItem.productNameSnapshot
      : "No items",
    totalAmount: Number(order.totalAmount),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  };
}

function decimalStringFromKobo(amountKobo: number) {
  return (amountKobo / 100).toFixed(2);
}

function toKobo(value: number) {
  return Math.round(value * 100);
}

function getOrderSlugSegment(shopSlug: string) {
  const cleaned = shopSlug.replace(/[^a-z0-9]/gi, "").toUpperCase();

  if (cleaned.length >= 4) {
    return cleaned.slice(0, 4);
  }

  return cleaned.padEnd(4, "X");
}

async function generateOrderNumber(shopSlug: string) {
  const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const slugSegment = getOrderSlugSegment(shopSlug);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const randomSegment = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    const orderNumber = `SLR-${slugSegment}-${dateSegment}-${randomSegment}`;

    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }

  throw new OrderServiceError(
    "Unable to create a unique order reference right now",
    500
  );
}

export async function createStorefrontOrder({
  shopSlug,
  input,
}: CreateStorefrontOrderParams) {
  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      whatsappNumber: true,
      products: {
        where: {
          id: input.productId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
        take: 1,
      },
    },
  });

  if (!shop) {
    throw new OrderServiceError("Store not found", 404);
  }

  const product = shop.products[0];

  if (!product) {
    throw new OrderServiceError("Selected product is not available", 404);
  }

  const unitPriceKobo = toKobo(Number(product.price));
  const subtotalKobo = unitPriceKobo * input.quantity;
  const orderNumber = await generateOrderNumber(shop.slug);
  const normalizedPhone = normalizePhoneNumber(input.customerPhone);
  const customerEmail = input.customerEmail?.trim().toLowerCase() || null;
  const customerName = input.customerName.trim();
  const deliveryAddress = input.deliveryAddress.trim();
  const customerNote = input.customerNote?.trim() || null;

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: {
        shopId_phone: {
          shopId: shop.id,
          phone: normalizedPhone,
        },
      },
      update: {
        name: customerName,
        email: customerEmail,
      },
      create: {
        shopId: shop.id,
        name: customerName,
        phone: normalizedPhone,
        email: customerEmail,
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return tx.order.create({
      data: {
        shopId: shop.id,
        customerId: customer.id,
        orderNumber,
        subtotal: decimalStringFromKobo(subtotalKobo),
        totalAmount: decimalStringFromKobo(subtotalKobo),
        deliveryAddress,
        customerNote,
        items: {
          create: [
            {
              productId: product.id,
              productNameSnapshot: product.name,
              unitPrice: decimalStringFromKobo(unitPriceKobo),
              quantity: input.quantity,
              lineTotal: decimalStringFromKobo(subtotalKobo),
            },
          ],
        },
        statusLogs: {
          create: [
            {
              newStatus: "NEW",
              note: "Order created from storefront checkout",
            },
          ],
        },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        deliveryAddress: true,
        customerNote: true,
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        shop: {
          select: {
            name: true,
            whatsappNumber: true,
            slug: true,
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
  });

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

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    whatsappUrl,
    successPath: `/store/${shop.slug}/success/${order.id}`,
  };
}

export async function getSellerOrderListData(
  userId: string
): Promise<SellerOrderListData | null> {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          totalAmount: true,
          orderStatus: true,
          paymentStatus: true,
          customer: {
            select: {
              name: true,
              phone: true,
            },
          },
          items: {
            select: {
              productNameSnapshot: true,
              quantity: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!shop) {
    return null;
  }

  const [totalOrders, newOrders, awaitingPaymentOrders, paidOrders, paidRevenue] =
    await prisma.$transaction([
      prisma.order.count({
        where: {
          shopId: shop.id,
        },
      }),
      prisma.order.count({
        where: {
          shopId: shop.id,
          orderStatus: "NEW",
        },
      }),
      prisma.order.count({
        where: {
          shopId: shop.id,
          paymentStatus: "PENDING",
        },
      }),
      prisma.order.count({
        where: {
          shopId: shop.id,
          paymentStatus: "PAID",
        },
      }),
      prisma.order.aggregate({
        where: {
          shopId: shop.id,
          paymentStatus: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

  return {
    shopName: shop.name,
    orders: shop.orders.map(serializeSellerOrderListItem),
    summary: {
      totalOrders,
      newOrders,
      awaitingPaymentOrders,
      paidOrders,
      collectedRevenue: Number(paidRevenue._sum.totalAmount ?? 0),
    },
  };
}

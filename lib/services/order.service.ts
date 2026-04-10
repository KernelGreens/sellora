import type { Prisma } from "@/lib/generated/prisma";
import { randomUUID } from "node:crypto";
import type { PaymentStatus } from "@/lib/generated/prisma";
import {
  canUpdateOrderStatus,
  getOrderStatusMeta,
} from "@/lib/constants/order-status";
import { prisma } from "@/lib/prisma";
import type {
  CreateStorefrontOrderInput,
  SellerOrderHistoryFiltersInput,
  UpdateSellerOrderStatusInput,
} from "@/lib/validations/order";
import type {
  SellerOrderDetailData,
  SellerOrderListData,
  SellerOrderListItem,
} from "@/types/order";
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

function getPaymentStatusForOrderStatus(nextStatus: UpdateSellerOrderStatusInput["status"]) {
  const paymentStatusMap: Partial<
    Record<UpdateSellerOrderStatusInput["status"], PaymentStatus>
  > = {
    AWAITING_PAYMENT: "PENDING",
    PAID: "PAID",
  };

  return paymentStatusMap[nextStatus];
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
      isActive: true,
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

  if (!shop.isActive) {
    throw new OrderServiceError("Store is currently unavailable", 404);
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
  userId: string,
  filtersInput?: SellerOrderHistoryFiltersInput
): Promise<SellerOrderListData | null> {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!shop) {
    return null;
  }

  const pageSize = 10;
  const page = Math.max(filtersInput?.page ?? 1, 1);
  const query = filtersInput?.q?.trim() ?? "";
  const orderStatus = filtersInput?.orderStatus ?? "ALL";
  const paymentStatus = filtersInput?.paymentStatus ?? "ALL";
  const where: Prisma.OrderWhereInput = {
    shopId: shop.id,
  };

  if (query) {
    where.OR = [
      {
        orderNumber: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        customer: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
      {
        customer: {
          phone: {
            contains: query,
          },
        },
      },
      {
        items: {
          some: {
            productNameSnapshot: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  if (orderStatus !== "ALL") {
    where.orderStatus = orderStatus;
  }

  if (paymentStatus !== "ALL") {
    where.paymentStatus = paymentStatus;
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

  const filteredTotalItems = await prisma.order.count({
    where,
  });
  const totalPages = Math.max(Math.ceil(filteredTotalItems / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const orders = await prisma.order.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
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
  });

  return {
    shopName: shop.name,
    orders: orders.map(serializeSellerOrderListItem),
    summary: {
      totalOrders,
      newOrders,
      awaitingPaymentOrders,
      paidOrders,
      collectedRevenue: Number(paidRevenue._sum.totalAmount ?? 0),
    },
    filters: {
      query,
      orderStatus,
      paymentStatus,
    },
    pagination: {
      page: safePage,
      pageSize,
      totalItems: filteredTotalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
}

export async function getSellerOrderDetailData(
  userId: string,
  orderId: string
): Promise<SellerOrderDetailData | null> {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!shop) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      shopId: shop.id,
    },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      updatedAt: true,
      subtotal: true,
      deliveryFee: true,
      totalAmount: true,
      paymentStatus: true,
      orderStatus: true,
      paymentReference: true,
      paymentProofUrl: true,
      deliveryAddress: true,
      customerNote: true,
      internalNote: true,
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          createdAt: true,
        },
      },
      items: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          productId: true,
          productNameSnapshot: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
        },
      },
      statusLogs: {
        orderBy: {
          changedAt: "desc",
        },
        select: {
          id: true,
          oldStatus: true,
          newStatus: true,
          note: true,
          changedAt: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    shopName: shop.name,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    subtotal: Number(order.subtotal),
    deliveryFee: order.deliveryFee === null ? null : Number(order.deliveryFee),
    totalAmount: Number(order.totalAmount),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    paymentReference: order.paymentReference,
    paymentProofUrl: order.paymentProofUrl,
    deliveryAddress: order.deliveryAddress,
    customerNote: order.customerNote,
    internalNote: order.internalNote,
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    customer: {
      id: order.customer.id,
      name: order.customer.name,
      phone: order.customer.phone,
      email: order.customer.email,
      createdAt: order.customer.createdAt.toISOString(),
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    statusLogs: order.statusLogs.map((log) => ({
      id: log.id,
      oldStatus: log.oldStatus,
      newStatus: log.newStatus,
      note: log.note,
      changedAt: log.changedAt.toISOString(),
    })),
  };
}

export async function updateSellerOrderStatus(
  userId: string,
  orderId: string,
  input: UpdateSellerOrderStatusInput
) {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  });

  if (!shop) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      shopId: shop.id,
    },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
    },
  });

  if (!order) {
    return null;
  }

  if (order.orderStatus === input.status) {
    throw new OrderServiceError("Order is already in that status");
  }

  if (!canUpdateOrderStatus(order.orderStatus, input.status)) {
    const currentStatusLabel = getOrderStatusMeta(order.orderStatus).label;
    const nextStatusLabel = getOrderStatusMeta(input.status).label;

    throw new OrderServiceError(
      `Cannot move this order from ${currentStatusLabel} to ${nextStatusLabel}`
    );
  }

  const note = input.note?.trim() || null;
  const nextPaymentStatus = getPaymentStatusForOrderStatus(input.status);

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const nextOrder = await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        orderStatus: input.status,
        ...(nextPaymentStatus
          ? {
              paymentStatus: nextPaymentStatus,
            }
          : {}),
      },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
        updatedAt: true,
      },
    });

    const statusLog = await tx.orderStatusLog.create({
      data: {
        orderId: order.id,
        oldStatus: order.orderStatus,
        newStatus: input.status,
        note,
      },
      select: {
        id: true,
        oldStatus: true,
        newStatus: true,
        note: true,
        changedAt: true,
      },
    });

    return {
      ...nextOrder,
      statusLog,
    };
  });

  return {
    id: updatedOrder.id,
    orderNumber: updatedOrder.orderNumber,
    orderStatus: updatedOrder.orderStatus,
    paymentStatus: updatedOrder.paymentStatus,
    updatedAt: updatedOrder.updatedAt.toISOString(),
    statusLog: {
      id: updatedOrder.statusLog.id,
      oldStatus: updatedOrder.statusLog.oldStatus,
      newStatus: updatedOrder.statusLog.newStatus,
      note: updatedOrder.statusLog.note,
      changedAt: updatedOrder.statusLog.changedAt.toISOString(),
    },
  };
}

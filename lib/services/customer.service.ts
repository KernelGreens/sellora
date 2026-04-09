import { prisma } from "@/lib/prisma";
import type {
  SellerCustomerDetailData,
  SellerCustomerListData,
  SellerCustomerListItem,
} from "@/types/customer";
import type { SellerCustomerListFiltersInput } from "@/lib/validations/customer";

function getCustomerRelationship(
  orderCount: number
): SellerCustomerListItem["relationship"] {
  return orderCount >= 2 ? "REPEAT" : "NEW";
}

function startOfCurrentMonth() {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getProductSummary(items: Array<{
  productNameSnapshot: string;
  quantity: number;
}>) {
  const firstItem = items[0];
  const extraProductsCount = Math.max(items.length - 1, 0);

  if (!firstItem) {
    return "No items";
  }

  if (extraProductsCount === 0) {
    return firstItem.productNameSnapshot;
  }

  return `${firstItem.productNameSnapshot} +${extraProductsCount} more`;
}

export async function getSellerCustomerListData(
  userId: string,
  filtersInput?: SellerCustomerListFiltersInput
): Promise<SellerCustomerListData | null> {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!shop) {
    return null;
  }

  const pageSize = 10;
  const page = Math.max(filtersInput?.page ?? 1, 1);
  const query = filtersInput?.q?.trim() ?? "";
  const relationship = filtersInput?.relationship ?? "ALL";
  const currentMonthStart = startOfCurrentMonth();
  const customerWhere = {
    shopId: shop.id,
    ...(query
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              phone: {
                contains: query,
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };
  const customers = await prisma.customer.findMany({
    where: customerWhere,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          totalAmount: true,
          paymentStatus: true,
        },
      },
    },
  });

  const customerItems: SellerCustomerListItem[] = customers.map((customer) => {
    const orderCount = customer.orders.length;
    const paidOrders = customer.orders.filter(
      (order) => order.paymentStatus === "PAID"
    );
    const latestOrder = customer.orders[0];

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      orderCount,
      paidOrderCount: paidOrders.length,
      totalSpent: paidOrders.reduce(
        (total, order) => total + Number(order.totalAmount),
        0
      ),
      latestOrderId: latestOrder?.id ?? null,
      latestOrderNumber: latestOrder?.orderNumber ?? null,
      lastOrderAt: latestOrder?.createdAt.toISOString() ?? null,
      createdAt: customer.createdAt.toISOString(),
      relationship: getCustomerRelationship(orderCount),
    };
  });

  const filteredCustomers =
    relationship === "ALL"
      ? customerItems
      : customerItems.filter((customer) => customer.relationship === relationship);
  const totalPages = Math.max(Math.ceil(filteredCustomers.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const paginatedCustomers = filteredCustomers.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return {
    shopName: shop.name,
    shopSlug: shop.slug,
    customers: paginatedCustomers,
    summary: {
      totalCustomers: customerItems.length,
      firstTimeCustomers: customerItems.filter(
        (customer) => customer.orderCount <= 1
      ).length,
      repeatCustomers: customerItems.filter(
        (customer) => customer.relationship === "REPEAT"
      ).length,
      customersAddedThisMonth: customers.filter(
        (customer) => customer.createdAt >= currentMonthStart
      ).length,
    },
    filters: {
      query,
      relationship,
    },
    pagination: {
      page: safePage,
      pageSize,
      totalItems: filteredCustomers.length,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
}

export async function getSellerCustomerDetailData(
  userId: string,
  customerId: string
): Promise<SellerCustomerDetailData | null> {
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

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      shopId: shop.id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          totalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          customerNote: true,
          items: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              productNameSnapshot: true,
              quantity: true,
            },
          },
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const paidOrders = customer.orders.filter(
    (order) => order.paymentStatus === "PAID"
  );
  const latestOrder = customer.orders[0];

  return {
    id: customer.id,
    shopName: shop.name,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    relationship: getCustomerRelationship(customer.orders.length),
    orderCount: customer.orders.length,
    paidOrderCount: paidOrders.length,
    totalSpent: paidOrders.reduce(
      (total, order) => total + Number(order.totalAmount),
      0
    ),
    latestOrderAt: latestOrder?.createdAt.toISOString() ?? null,
    orders: customer.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      productSummary: getProductSummary(order.items),
      customerNote: order.customerNote,
    })),
  };
}

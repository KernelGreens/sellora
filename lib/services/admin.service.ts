import { prisma } from "@/lib/prisma";

type AdminOverviewFilters = {
  userQuery?: string | null;
  shopQuery?: string | null;
};

const ADMIN_USER_LIST_LIMIT = 12;
const ADMIN_SHOP_LIST_LIMIT = 12;

type ReadinessTone = "success" | "warning" | "muted";

function normalizeQuery(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function getShopReadiness(shop: {
  isActive: boolean;
  description: string | null;
  logoUrl: string | null;
  productCount: number;
}) {
  if (shop.productCount === 0) {
    return {
      label: "Needs products",
      detail: "Shop exists but no products have been added yet.",
      tone: "warning" as ReadinessTone,
    };
  }

  if (!shop.description || !shop.logoUrl) {
    return {
      label: "Setup in progress",
      detail: "Core branding details are still missing.",
      tone: "warning" as ReadinessTone,
    };
  }

  if (!shop.isActive) {
    return {
      label: "Paused",
      detail: "Storefront is configured but not currently live.",
      tone: "muted" as ReadinessTone,
    };
  }

  return {
    label: "Pilot-ready",
    detail: "Products and primary storefront branding are in place.",
    tone: "success" as ReadinessTone,
  };
}

function mapAdminUser(user: {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  shop: {
    name: string;
    slug: string;
    isActive: boolean;
    logoUrl: string | null;
    description: string | null;
    _count: {
      products: number;
    };
  } | null;
}) {
  if (!user.shop) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
      shop: null,
      readiness: {
        label: "No shop",
        detail: "Account exists, but shop onboarding has not been completed.",
        tone: "muted" as ReadinessTone,
      },
    };
  }

  const readiness = getShopReadiness({
    isActive: user.shop.isActive,
    description: user.shop.description,
    logoUrl: user.shop.logoUrl,
    productCount: user.shop._count.products,
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt.toISOString(),
    shop: {
      name: user.shop.name,
      slug: user.shop.slug,
      isActive: user.shop.isActive,
      productCount: user.shop._count.products,
    },
    readiness,
  };
}

function mapAdminShop(shop: {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  description: string | null;
  logoUrl: string | null;
  createdAt: Date;
  user: {
    fullName: string;
    email: string;
  };
  _count: {
    products: number;
    orders: number;
    customers: number;
  };
}) {
  const readiness = getShopReadiness({
    isActive: shop.isActive,
    description: shop.description,
    logoUrl: shop.logoUrl,
    productCount: shop._count.products,
  });

  return {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    isActive: shop.isActive,
    createdAt: shop.createdAt.toISOString(),
    owner: {
      fullName: shop.user.fullName,
      email: shop.user.email,
    },
    metrics: {
      products: shop._count.products,
      orders: shop._count.orders,
      customers: shop._count.customers,
    },
    readiness,
  };
}

export async function getAdminOverviewData(filters: AdminOverviewFilters = {}) {
  const userQuery = normalizeQuery(filters.userQuery);
  const shopQuery = normalizeQuery(filters.shopQuery);

  const userWhere = userQuery
    ? {
        OR: [
          {
            fullName: {
              contains: userQuery,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: userQuery,
              mode: "insensitive" as const,
            },
          },
          {
            shop: {
              is: {
                OR: [
                  {
                    name: {
                      contains: userQuery,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    slug: {
                      contains: userQuery,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          },
        ],
      }
    : undefined;

  const shopWhere = shopQuery
    ? {
        OR: [
          {
            name: {
              contains: shopQuery,
              mode: "insensitive" as const,
            },
          },
          {
            slug: {
              contains: shopQuery,
              mode: "insensitive" as const,
            },
          },
          {
            user: {
              is: {
                OR: [
                  {
                    fullName: {
                      contains: shopQuery,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: shopQuery,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          },
        ],
      }
    : undefined;

  const [
    totalUsers,
    totalShops,
    activeShops,
    totalOrders,
    recentUsers,
    recentShops,
    recentOrders,
    matchingUsersCount,
    filteredUsers,
    matchingShopsCount,
    filteredShops,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.shop.count(),
    prisma.shop.count({
      where: { isActive: true },
    }),
    prisma.order.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        shop: {
          select: {
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        createdAt: true,
        shop: {
          select: {
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.count({ where: userWhere }),
    prisma.user.findMany({
      where: userWhere,
      orderBy: { createdAt: "desc" },
      take: ADMIN_USER_LIST_LIMIT,
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        shop: {
          select: {
            name: true,
            slug: true,
            isActive: true,
            logoUrl: true,
            description: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
      },
    }),
    prisma.shop.count({ where: shopWhere }),
    prisma.shop.findMany({
      where: shopWhere,
      orderBy: { createdAt: "desc" },
      take: ADMIN_SHOP_LIST_LIMIT,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        description: true,
        logoUrl: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
          },
        },
      },
    }),
  ]);

  return {
    filters: {
      userQuery,
      shopQuery,
    },
    summary: {
      totalUsers,
      totalShops,
      activeShops,
      inactiveShops: totalShops - activeShops,
      totalOrders,
    },
    recentUsers: recentUsers.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
      shop: user.shop
        ? {
            name: user.shop.name,
            slug: user.shop.slug,
            isActive: user.shop.isActive,
          }
        : null,
    })),
    recentShops: recentShops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      isActive: shop.isActive,
      createdAt: shop.createdAt.toISOString(),
      owner: {
        fullName: shop.user.fullName,
        email: shop.user.email,
      },
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount.toString(),
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      shop: {
        name: order.shop.name,
        slug: order.shop.slug,
      },
      customer: {
        name: order.customer.name,
      },
    })),
    users: {
      totalMatches: matchingUsersCount,
      pageSize: ADMIN_USER_LIST_LIMIT,
      items: filteredUsers.map(mapAdminUser),
    },
    shops: {
      totalMatches: matchingShopsCount,
      pageSize: ADMIN_SHOP_LIST_LIMIT,
      items: filteredShops.map(mapAdminShop),
    },
  };
}

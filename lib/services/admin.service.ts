import { prisma } from "@/lib/prisma";

export async function getAdminOverviewData() {
  const [totalUsers, totalShops, activeShops, totalOrders, recentUsers, recentShops, recentOrders] =
    await Promise.all([
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
    ]);

  return {
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
  };
}

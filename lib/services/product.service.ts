import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  SellerProductEditData,
  SellerProductListData,
  SellerProductListItem,
} from "@/types/product";
import type {
  CreateProductInput,
  SellerProductListFiltersInput,
} from "@/lib/validations/product";

export const SELLER_PRODUCT_LOW_STOCK_THRESHOLD = 5;

export class ProductServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ProductServiceError";
    this.statusCode = statusCode;
  }
}

function getProductStockState(
  stockQuantity: number | null
): SellerProductListItem["stockState"] {
  if (stockQuantity === null) {
    return "UNTRACKED";
  }

  if (stockQuantity === 0) {
    return "OUT";
  }

  if (stockQuantity <= SELLER_PRODUCT_LOW_STOCK_THRESHOLD) {
    return "LOW";
  }

  return "HEALTHY";
}

function serializeSellerProductListItem(product: {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string };
  imageUrl: string | null;
  isActive: boolean;
  stockQuantity: number | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    orderItems: number;
  };
}): SellerProductListItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    isActive: product.isActive,
    stockQuantity: product.stockQuantity,
    stockState: getProductStockState(product.stockQuantity),
    orderCount: product._count.orderItems,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

function applyStockFilter(
  where: Prisma.ProductWhereInput,
  stockStatus: NonNullable<SellerProductListFiltersInput["stockStatus"]>
) {
  if (stockStatus === "ALL") {
    return;
  }

  if (stockStatus === "HEALTHY") {
    where.stockQuantity = {
      gt: SELLER_PRODUCT_LOW_STOCK_THRESHOLD,
    };
    return;
  }

  if (stockStatus === "LOW") {
    where.stockQuantity = {
      gte: 1,
      lte: SELLER_PRODUCT_LOW_STOCK_THRESHOLD,
    };
    return;
  }

  if (stockStatus === "OUT") {
    where.stockQuantity = 0;
    return;
  }

  where.stockQuantity = null;
}

export async function getSellerProductListData(
  userId: string,
  filtersInput?: SellerProductListFiltersInput
): Promise<SellerProductListData | null> {
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
  const visibility = filtersInput?.visibility ?? "ALL";
  const stockStatus = filtersInput?.stockStatus ?? "ALL";
  const where: Prisma.ProductWhereInput = {
    shopId: shop.id,
  };

  if (query) {
    where.OR = [
      {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query,
          mode: "insensitive",
        },
      },
    ];
  }

  if (visibility === "ACTIVE") {
    where.isActive = true;
  } else if (visibility === "HIDDEN") {
    where.isActive = false;
  }

  applyStockFilter(where, stockStatus);

  const [
    totalProducts,
    activeProducts,
    hiddenProducts,
    lowStockProducts,
    outOfStockProducts,
    filteredTotalItems,
  ] = await prisma.$transaction([
    prisma.product.count({
      where: {
        shopId: shop.id,
      },
    }),
    prisma.product.count({
      where: {
        shopId: shop.id,
        isActive: true,
      },
    }),
    prisma.product.count({
      where: {
        shopId: shop.id,
        isActive: false,
      },
    }),
    prisma.product.count({
      where: {
        shopId: shop.id,
        stockQuantity: {
          gte: 1,
          lte: SELLER_PRODUCT_LOW_STOCK_THRESHOLD,
        },
      },
    }),
    prisma.product.count({
      where: {
        shopId: shop.id,
        stockQuantity: 0,
      },
    }),
    prisma.product.count({
      where,
    }),
  ]);

  const totalPages = Math.max(Math.ceil(filteredTotalItems / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const products = await prisma.product.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    skip: (safePage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      isActive: true,
      stockQuantity: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  return {
    shopName: shop.name,
    shopSlug: shop.slug,
    products: products.map(serializeSellerProductListItem),
    summary: {
      totalProducts,
      activeProducts,
      hiddenProducts,
      lowStockProducts,
      outOfStockProducts,
    },
    filters: {
      query,
      visibility,
      stockStatus,
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

export async function createSellerProduct(userId: string, input: CreateProductInput) {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  });

  if (!shop) {
    throw new ProductServiceError("Create your shop first", 400);
  }

  return prisma.product.create({
    data: {
      shopId: shop.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      stockQuantity: input.stockQuantity ?? null,
      imageUrl: input.imageUrl?.trim() || null,
      isActive: input.isActive ?? true,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      stockQuantity: true,
    },
  });
}

export async function getSellerProductEditData(
  userId: string,
  productId: string
): Promise<SellerProductEditData | null> {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!shop) {
    throw new ProductServiceError("Create your shop first", 400);
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId: shop.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stockQuantity: true,
      imageUrl: true,
      isActive: true,
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    shopName: shop.name,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stockQuantity: product.stockQuantity,
    imageUrl: product.imageUrl,
    isActive: product.isActive,
  };
}

export async function updateSellerProduct(
  userId: string,
  productId: string,
  input: CreateProductInput
) {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
    },
  });

  if (!shop) {
    throw new ProductServiceError("Create your shop first", 400);
  }

  const existingProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId: shop.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingProduct) {
    throw new ProductServiceError("Product not found", 404);
  }

  return prisma.product.update({
    where: {
      id: existingProduct.id,
    },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      stockQuantity: input.stockQuantity ?? null,
      imageUrl: input.imageUrl?.trim() || null,
      isActive: input.isActive ?? true,
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      stockQuantity: true,
    },
  });
}

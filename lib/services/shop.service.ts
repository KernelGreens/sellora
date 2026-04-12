import { prisma } from "@/lib/prisma";
import type { SellerShopSettingsData } from "@/types/shop";
import type {
  UpdateAdminShopStatusInput,
  UpdateShopInput,
} from "@/lib/validations/shop";
import { normalizeSlug } from "@/lib/utils/slug";

export class ShopServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ShopServiceError";
    this.statusCode = statusCode;
  }
}

export async function getSellerShopSettingsData(
  userId: string
): Promise<SellerShopSettingsData | null> {
  const shop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      whatsappNumber: true,
      instagramHandle: true,
      bankName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      logoUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: true,
          customers: true,
          orders: true,
        },
      },
    },
  });

  if (!shop) {
    return null;
  }

  const activeProducts = await prisma.product.count({
    where: {
      shopId: shop.id,
      isActive: true,
    },
  });

  return {
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    description: shop.description,
    whatsappNumber: shop.whatsappNumber,
    instagramHandle: shop.instagramHandle,
    bankName: shop.bankName,
    bankAccountName: shop.bankAccountName,
    bankAccountNumber: shop.bankAccountNumber,
    logoUrl: shop.logoUrl,
    isActive: shop.isActive,
    createdAt: shop.createdAt.toISOString(),
    updatedAt: shop.updatedAt.toISOString(),
    storefrontUrl: `/store/${shop.slug}`,
    summary: {
      totalProducts: shop._count.products,
      activeProducts,
      customerCount: shop._count.customers,
      orderCount: shop._count.orders,
    },
  };
}

export async function updateSellerShopSettings(
  userId: string,
  input: UpdateShopInput
): Promise<SellerShopSettingsData> {
  const existingShop = await prisma.shop.findUnique({
    where: { userId },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!existingShop) {
    throw new ShopServiceError("Shop not found", 404);
  }

  const normalizedSlug = normalizeSlug(input.slug);

  if (normalizedSlug !== existingShop.slug) {
    const slugTaken = await prisma.shop.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    });

    if (slugTaken && slugTaken.id !== existingShop.id) {
      throw new ShopServiceError("This shop URL is already taken", 409);
    }
  }

  await prisma.shop.update({
    where: { id: existingShop.id },
    data: {
      name: input.name.trim(),
      slug: normalizedSlug,
      description: input.description?.trim() || null,
      whatsappNumber: input.whatsappNumber.trim(),
      instagramHandle: input.instagramHandle?.trim() || null,
      bankName: input.bankName.trim(),
      bankAccountName: input.bankAccountName.trim(),
      bankAccountNumber: input.bankAccountNumber.trim(),
      logoUrl: input.logoUrl?.trim() || null,
      isActive: input.isActive,
    },
  });

  const updatedShop = await getSellerShopSettingsData(userId);

  if (!updatedShop) {
    throw new ShopServiceError("Unable to load updated shop settings", 500);
  }

  return updatedShop;
}

export async function updateAdminShopStatus(
  shopId: string,
  input: UpdateAdminShopStatusInput
) {
  const existingShop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      updatedAt: true,
    },
  });

  if (!existingShop) {
    throw new ShopServiceError("Shop not found", 404);
  }

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data: {
      isActive: input.isActive,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return {
    id: updatedShop.id,
    name: updatedShop.name,
    slug: updatedShop.slug,
    isActive: updatedShop.isActive,
    updatedAt: updatedShop.updatedAt.toISOString(),
    previousStatus: existingShop.isActive,
  };
}

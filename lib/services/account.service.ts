import { prisma } from "@/lib/prisma";
import type {
  UpdateAccountSettingsInput,
  UpdateAdminUserRoleInput,
} from "@/lib/validations/account";
import type { SellerAccountSettingsData } from "@/types/account";

export class AccountServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AccountServiceError";
    this.statusCode = statusCode;
  }
}

export async function getDashboardAccountIdentity(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      fullName: true,
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    fullName: user.fullName,
    email: user.email,
  };
}

export async function getSellerAccountSettingsData(
  userId: string
): Promise<SellerAccountSettingsData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              customers: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    summary: {
      hasPhone: Boolean(user.phone),
      hasShop: Boolean(user.shop),
      activeStorefront: Boolean(user.shop?.isActive),
      totalOrders: user.shop?._count.orders ?? 0,
      totalCustomers: user.shop?._count.customers ?? 0,
    },
    shop: user.shop
      ? {
          id: user.shop.id,
          name: user.shop.name,
          slug: user.shop.slug,
          isActive: user.shop.isActive,
          storefrontUrl: `/store/${user.shop.slug}`,
          createdAt: user.shop.createdAt.toISOString(),
          updatedAt: user.shop.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function updateSellerAccountSettings(
  userId: string,
  input: UpdateAccountSettingsInput
): Promise<SellerAccountSettingsData> {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
    },
  });

  if (!existingUser) {
    throw new AccountServiceError("Account not found", 404);
  }

  const normalizedEmail = input.email.trim().toLowerCase();

  if (normalizedEmail !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (emailTaken && emailTaken.id !== existingUser.id) {
      throw new AccountServiceError("This email address is already in use", 409);
    }
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      fullName: input.fullName.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() || null,
    },
  });

  const updatedAccount = await getSellerAccountSettingsData(userId);

  if (!updatedAccount) {
    throw new AccountServiceError("Unable to load updated account settings", 500);
  }

  return updatedAccount;
}

export async function updateAdminUserRole(
  actingUserId: string,
  targetUserId: string,
  input: UpdateAdminUserRoleInput
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      fullName: true,
      email: true,
      isAdmin: true,
      updatedAt: true,
    },
  });

  if (!targetUser) {
    throw new AccountServiceError("User not found", 404);
  }

  if (!input.isAdmin && actingUserId === targetUserId) {
    throw new AccountServiceError(
      "You cannot remove your own admin access from the admin panel.",
      400
    );
  }

  if (!input.isAdmin && targetUser.isAdmin) {
    const totalAdmins = await prisma.user.count({
      where: { isAdmin: true },
    });

    if (totalAdmins <= 1) {
      throw new AccountServiceError(
        "At least one admin must remain on the platform.",
        400
      );
    }
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const nextUser = await tx.user.update({
      where: { id: targetUserId },
      data: {
        isAdmin: input.isAdmin,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isAdmin: true,
        updatedAt: true,
      },
    });

    await tx.adminAuditLog.create({
      data: {
        actorUserId: actingUserId,
        action: input.isAdmin ? "USER_PROMOTED_TO_ADMIN" : "USER_REMOVED_FROM_ADMIN",
        entityType: "USER",
        entityId: nextUser.id,
        summary: input.isAdmin
          ? `${nextUser.fullName} was granted admin access.`
          : `${nextUser.fullName} had admin access removed.`,
        metadata: {
          previousIsAdmin: targetUser.isAdmin,
          nextIsAdmin: input.isAdmin,
          targetEmail: nextUser.email,
        },
      },
    });

    return nextUser;
  });

  return {
    id: updatedUser.id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    updatedAt: updatedUser.updatedAt.toISOString(),
    previousIsAdmin: targetUser.isAdmin,
  };
}

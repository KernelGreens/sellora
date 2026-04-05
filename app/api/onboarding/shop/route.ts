import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createShopSchema } from "@/lib/validations/shop";
import { normalizeSlug } from "@/lib/utils/slug";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createShopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const data = parsed.data;
    const normalizedSlug = normalizeSlug(data.slug);

    const existingShop = await prisma.shop.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existingShop) {
      return NextResponse.json(
        { message: "You have already created a shop" },
        { status: 409 }
      );
    }

    const slugTaken = await prisma.shop.findUnique({
      where: { slug: normalizedSlug },
      select: { id: true },
    });

    if (slugTaken) {
      return NextResponse.json(
        { message: "This shop URL is already taken" },
        { status: 409 }
      );
    }

    const shop = await prisma.shop.create({
      data: {
        userId,
        name: data.name.trim(),
        slug: normalizedSlug,
        description: data.description?.trim() || null,
        whatsappNumber: data.whatsappNumber.trim(),
        instagramHandle: data.instagramHandle?.trim() || null,
        bankName: data.bankName.trim(),
        bankAccountName: data.bankAccountName.trim(),
        bankAccountNumber: data.bankAccountNumber.trim(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json(
      {
        message: "Shop created successfully",
        shop,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create shop error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
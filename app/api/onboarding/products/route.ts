import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { createManyProductsSchema } from "@/lib/validations/product";

export async function POST(request: Request) {
  try {
    const user = await getRequestAuthUser(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json(
        { message: "Create your shop first" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = createManyProductsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const products = parsed.data.products.map((product) => ({
      shopId: shop.id,
      name: product.name.trim(),
      description: product.description?.trim() || null,
      price: product.price,
      stockQuantity: product.stockQuantity ?? null,
      imageUrl: product.imageUrl?.trim() || null,
      isActive: product.isActive ?? true,
    }));

    await prisma.product.createMany({
      data: products,
    });

    return NextResponse.json(
      { message: "Products added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create onboarding products error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import {
  getSellerProductEditData,
  ProductServiceError,
  updateSellerProduct,
} from "@/lib/services/product.service";
import { createProductSchema } from "@/lib/validations/product";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await context.params;

  try {
    const product = await getSellerProductEditData(user.id, productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to load product right now" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid product payload",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { productId } = await context.params;

  try {
    const product = await updateSellerProduct(user.id, productId, parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to update product right now" },
      { status: 500 }
    );
  }
}

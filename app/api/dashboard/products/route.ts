import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import {
  createSellerProduct,
  getSellerProductListData,
  ProductServiceError,
} from "@/lib/services/product.service";
import {
  createProductSchema,
  sellerProductListFiltersSchema,
} from "@/lib/validations/product";

function getSearchParamValue(value: string | null) {
  return value ?? undefined;
}

export async function GET(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedFilters = sellerProductListFiltersSchema.safeParse({
    q: getSearchParamValue(searchParams.get("q")),
    visibility: getSearchParamValue(searchParams.get("visibility")),
    stockStatus: getSearchParamValue(searchParams.get("stockStatus")),
    page: getSearchParamValue(searchParams.get("page")),
  });
  const filtersInput = parsedFilters.success ? parsedFilters.data : {};
  const data = await getSellerProductListData(user.id, filtersInput);

  if (!data) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
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

  try {
    const product = await createSellerProduct(user.id, parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof ProductServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json(
      { error: "Unable to create product right now" },
      { status: 500 }
    );
  }
}

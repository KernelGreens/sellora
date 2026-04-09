import { NextResponse } from "next/server";
import { getRequestAuthUser } from "@/lib/auth-session";
import { getSellerCustomerListData } from "@/lib/services/customer.service";
import { sellerCustomerListFiltersSchema } from "@/lib/validations/customer";

function getSearchParamValue(value: string | null) {
  return value ?? undefined;
}

export async function GET(request: Request) {
  const user = await getRequestAuthUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedFilters = sellerCustomerListFiltersSchema.safeParse({
    q: getSearchParamValue(searchParams.get("q")),
    relationship: getSearchParamValue(searchParams.get("relationship")),
    page: getSearchParamValue(searchParams.get("page")),
  });
  const filtersInput = parsedFilters.success ? parsedFilters.data : {};
  const data = await getSellerCustomerListData(user.id, filtersInput);

  if (!data) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

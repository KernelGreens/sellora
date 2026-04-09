import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductEditForm } from "@/components/dashboard/product-create-form";
import { getServerAuthUser } from "@/lib/auth-session";
import {
  getSellerProductEditData,
  ProductServiceError,
} from "@/lib/services/product.service";

type DashboardEditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function DashboardEditProductPage({
  params,
}: DashboardEditProductPageProps) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { productId } = await params;
  let product;

  try {
    product = await getSellerProductEditData(user.id, productId);
  } catch (error) {
    if (error instanceof ProductServiceError && error.statusCode === 400) {
      redirect("/onboarding/shop");
    }

    throw error;
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="w-fit px-0">
          <Link href="/dashboard/products">
            <ArrowLeft className="size-4" />
            Back to products
          </Link>
        </Button>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
          <p className="text-sm text-muted-foreground">
            Update the listing for {product.name} in {product.shopName}.
          </p>
        </div>
      </div>

      <ProductEditForm
        productId={product.id}
        initialValues={{
          name: product.name,
          description: product.description || "",
          price: String(product.price),
          stockQuantity:
            product.stockQuantity === null ? "" : String(product.stockQuantity),
          imageUrl: product.imageUrl || "",
          isActive: product.isActive,
        }}
      />
    </div>
  );
}

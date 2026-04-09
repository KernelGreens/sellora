import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductCreateForm } from "@/components/dashboard/product-create-form";
import { getServerAuthUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export default async function DashboardNewProductPage() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const shop = await prisma.shop.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
    },
  });

  if (!shop) {
    redirect("/onboarding/shop");
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
          <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
          <p className="text-sm text-muted-foreground">
            Add a new listing for {shop.name} without leaving the dashboard.
          </p>
        </div>
      </div>

      <ProductCreateForm />
    </div>
  );
}

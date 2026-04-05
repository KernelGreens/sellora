import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingProductsForm } from "@/components/onboarding/onboarding-products-form";

export default async function OnboardingProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const shop = await prisma.shop.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      products: {
        select: { id: true },
        take: 1,
      },
    },
  });

  if (!shop) {
    redirect("/onboarding/shop");
  }

  if (shop.products.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add your first products</h1>
        <p className="mt-2 text-muted-foreground">
          Start with at least one product so your storefront is ready for customers.
        </p>
      </div>

      <OnboardingProductsForm />
    </div>
  );
}
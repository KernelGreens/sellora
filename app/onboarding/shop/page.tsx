import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShopOnboardingForm } from "@/components/onboarding/shop-onboarding-form";

export default async function OnboardingShopPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const existingShop = await prisma.shop.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (existingShop) {
    redirect("/onboarding/products");
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Set up your shop</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us about your business so customers can discover and order from your store.
        </p>
      </div>

      <ShopOnboardingForm />
    </div>
  );
}
import { Store } from "lucide-react";
import { redirect } from "next/navigation";
import { StorefrontShareCard } from "@/components/dashboard/storefront-share-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerAuthUser } from "@/lib/auth-session";
import { getSellerShopSettingsData } from "@/lib/services/shop.service";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const shop = await getSellerShopSettingsData(user.id);

  if (!shop) {
    redirect("/onboarding/shop");
  }

  if (shop.summary.totalProducts === 0) {
    redirect("/onboarding/products");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <Card className="overflow-hidden border-primary/15 bg-linear-to-br from-primary via-primary to-emerald-500 text-primary-foreground shadow-lg">
          <CardContent className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex min-h-full flex-col justify-center gap-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className={cn(
                    "flex size-18 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white shadow-sm sm:size-24",
                    shop.logoUrl && "bg-cover bg-center bg-no-repeat"
                  )}
                  style={
                    shop.logoUrl
                      ? {
                          backgroundImage: `url(${shop.logoUrl})`,
                        }
                      : undefined
                  }
                >
                  {!shop.logoUrl ? <Store className="size-9 sm:size-10" /> : null}
                </div>

                <div className="min-w-0 space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                    {shop.name}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-white/82 sm:text-base">
                    {shop.description ||
                      `This is the storefront customers should remember, trust, and share. Promote it directly from your dashboard whenever you want more traffic.`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StorefrontShareCard
          shopName={shop.name}
          storefrontPath={shop.storefrontUrl}
          description={shop.description}
          isActive={shop.isActive}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your storefront identity and core operating numbers at a glance.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total products</CardDescription>
            <CardTitle className="text-3xl">{shop.summary.totalProducts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active listings</CardDescription>
            <CardTitle className="text-3xl">{shop.summary.activeProducts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total customers</CardDescription>
            <CardTitle className="text-3xl">{shop.summary.customerCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-3xl">{shop.summary.orderCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Why this matters on mobile</CardTitle>
            <CardDescription>
              Sellers often promote their stores from chats, status updates, and social bios. The dashboard should make that easy in one tap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Your store name is now the focal point of the dashboard so it feels like a real business hub rather than a generic admin screen.
            </p>
            <p>
              The share flow uses a stronger default message, includes the storefront link automatically, and works well for WhatsApp, Instagram DM, SMS, and other mobile share targets.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next growth move</CardTitle>
            <CardDescription>
              Once this share flow feels right, the next natural extension is better shared-link previews and shop-specific metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Improve storefront social preview cards with logo, name, and description.</p>
            <p>Track share-to-visit performance later as part of the growth analytics phase.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

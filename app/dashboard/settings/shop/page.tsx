import Link from "next/link";
import { format } from "date-fns";
import {
  AtSign,
  BadgeCheck,
  ExternalLink,
  ImageIcon,
  Landmark,
  MessageCircle,
  Package,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShopSettingsForm } from "@/components/dashboard/shop-settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getServerAuthUser } from "@/lib/auth-session";
import { getSellerShopSettingsData } from "@/lib/services/shop.service";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  return format(new Date(value), "dd MMM yyyy");
}

function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `${"•".repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`;
}

function ensureInstagramHandle(value: string | null) {
  if (!value) {
    return null;
  }

  return value.startsWith("@") ? value : `@${value}`;
}

function getSetupItems(shop: Awaited<ReturnType<typeof getSellerShopSettingsData>>) {
  if (!shop) {
    return [];
  }

  return [
    {
      label: "Storefront URL is ready",
      complete: Boolean(shop.slug),
      detail: shop.storefrontUrl,
    },
    {
      label: "WhatsApp ordering contact is set",
      complete: Boolean(shop.whatsappNumber),
      detail: shop.whatsappNumber,
    },
    {
      label: "Shop description is added",
      complete: Boolean(shop.description),
      detail: shop.description || "Add a short pitch for first-time visitors.",
    },
    {
      label: "Instagram handle is connected",
      complete: Boolean(shop.instagramHandle),
      detail:
        ensureInstagramHandle(shop.instagramHandle) ||
        "Add your Instagram handle for social discovery.",
    },
    {
      label: "Brand logo is uploaded",
      complete: Boolean(shop.logoUrl),
      detail: shop.logoUrl ? "Logo available for dashboard and storefront use." : "Upload a logo to strengthen shop identity.",
    },
    {
      label: "Bank payout details are complete",
      complete: Boolean(
        shop.bankName && shop.bankAccountName && shop.bankAccountNumber
      ),
      detail: `${shop.bankName} • ${maskAccountNumber(shop.bankAccountNumber)}`,
    },
  ];
}

export default async function DashboardShopSettingsPage() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const shop = await getSellerShopSettingsData(user.id);

  if (!shop) {
    redirect("/onboarding/shop");
  }

  const setupItems = getSetupItems(shop);
  const completeSetupItems = setupItems.filter((item) => item.complete).length;
  const setupCompletion = Math.round(
    (completeSetupItems / Math.max(setupItems.length, 1)) * 100
  );
  const storefrontStatusClassName = shop.isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Shop settings
            </h1>
            <Badge variant="outline" className={storefrontStatusClassName}>
              {shop.isActive ? "Storefront ready" : "Shop paused"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Review the public details, contact channels, and payout information
            currently attached to {shop.name}.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={shop.storefrontUrl}>
              View storefront
              <ExternalLink className="size-4" />
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/dashboard/products">Review listings</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total products</CardDescription>
            <CardTitle className="text-3xl">
              {shop.summary.totalProducts}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active listings</CardDescription>
            <CardTitle className="text-3xl">
              {shop.summary.activeProducts}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Customers captured</CardDescription>
            <CardTitle className="text-3xl">
              {shop.summary.customerCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-3xl">
              {shop.summary.orderCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storefront identity</CardTitle>
              <CardDescription>
                This is the core branding and public-facing profile customers
                recognize when they land on your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={cn(
                    "flex size-20 shrink-0 items-center justify-center rounded-2xl border bg-muted text-muted-foreground",
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
                  {!shop.logoUrl ? <Store className="size-8" /> : null}
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-lg font-semibold">{shop.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Public path: {shop.storefrontUrl}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {shop.description ||
                      "No shop description has been added yet. This is worth filling in before you share the storefront widely."}
                  </p>
                </div>
              </div>

              <Separator />

              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Shop slug</dt>
                  <dd className="text-sm text-muted-foreground">{shop.slug}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Storefront status</dt>
                  <dd className="text-sm text-muted-foreground">
                    {shop.isActive
                      ? "Configured and ready for customers"
                      : "Shop record exists but is currently marked inactive"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Created</dt>
                  <dd className="text-sm text-muted-foreground">
                    {formatDate(shop.createdAt)}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium">Last updated</dt>
                  <dd className="text-sm text-muted-foreground">
                    {formatDate(shop.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup checklist</CardTitle>
              <CardDescription>
                A quick audit of what is already configured versus what still
                needs polish before the update flow lands.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Configuration coverage</p>
                    <p className="text-sm text-muted-foreground">
                      {completeSetupItems} of {setupItems.length} setup items are in
                      place.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{setupCompletion}%</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Ready
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {setupItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-2xl border p-4"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                        item.complete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      )}
                    >
                      <BadgeCheck className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{item.label}</p>
                        <Badge
                          variant="outline"
                          className={
                            item.complete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }
                        >
                          {item.complete ? "Ready" : "Recommended"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact channels</CardTitle>
              <CardDescription>
                These are the buyer-facing paths customers can use to reach or
                discover the shop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <MessageCircle className="mt-0.5 size-5 text-emerald-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    {shop.whatsappNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <AtSign className="mt-0.5 size-5 text-pink-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Instagram</p>
                  <p className="text-sm text-muted-foreground">
                    {ensureInstagramHandle(shop.instagramHandle) ||
                      "Not connected yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Store className="mt-0.5 size-5 text-sky-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Storefront link</p>
                  <Link
                    href={shop.storefrontUrl}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {shop.storefrontUrl}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout details</CardTitle>
              <CardDescription>
                The bank details sellers expect to use when customers request
                transfer payment instructions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border p-4">
                <Landmark className="mt-0.5 size-5 text-amber-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">{shop.bankName}</p>
                  <p className="text-sm text-muted-foreground">
                    {shop.bankAccountName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {maskAccountNumber(shop.bankAccountNumber)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational context</CardTitle>
              <CardDescription>
                A quick view of the current shop footprint inside the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border p-4">
                <Package className="size-5 text-sky-600" />
                <div>
                  <p className="text-sm font-medium">
                    {shop.summary.activeProducts} active listings
                  </p>
                  <p className="text-sm text-muted-foreground">
                    out of {shop.summary.totalProducts} total products
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border p-4">
                <Users className="size-5 text-violet-600" />
                <div>
                  <p className="text-sm font-medium">
                    {shop.summary.customerCount} customers captured
                  </p>
                  <p className="text-sm text-muted-foreground">
                    from completed checkout activity so far
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border p-4">
                <ShoppingCart className="size-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">
                    {shop.summary.orderCount} total orders
                  </p>
                  <p className="text-sm text-muted-foreground">
                    available for operations, status updates, and customer follow-up
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border p-4">
                <ImageIcon className="size-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">
                    Branding can be refined further
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The next slice can turn this audit page into a full shop
                    settings update flow.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ShopSettingsForm
        initialValues={{
          name: shop.name,
          slug: shop.slug,
          description: shop.description || "",
          whatsappNumber: shop.whatsappNumber,
          instagramHandle: shop.instagramHandle || "",
          bankName: shop.bankName,
          bankAccountName: shop.bankAccountName,
          bankAccountNumber: shop.bankAccountNumber,
          logoUrl: shop.logoUrl || "",
          isActive: shop.isActive,
        }}
      />
    </div>
  );
}

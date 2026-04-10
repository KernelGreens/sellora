// app/store/[slug]/page.tsx
import { Store } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontProductCard } from "@/components/storefront/storefront-product-card";

export const dynamic = "force-dynamic";

type StorefrontPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    productId?: string | string[];
    quantity?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSelectedQuantity(value: string | undefined) {
  const parsed = Number.parseInt(value || "1", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export default async function StorefrontPage({
  params,
  searchParams,
}: StorefrontPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const selectedProductId = getSearchParamValue(query.productId);
  const selectedQuantity = getSelectedQuantity(getSearchParamValue(query.quantity));

  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      whatsappNumber: true,
      instagramHandle: true,
      logoUrl: true,
      isActive: true,
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!shop || !shop.isActive) {
    notFound();
  }

  const whatsappHref = `https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 rounded-3xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div
              className="flex size-20 shrink-0 items-center justify-center rounded-2xl border bg-muted bg-cover bg-center text-muted-foreground"
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

            <div>
              <h1 className="text-3xl font-bold">{shop.name}</h1>

              {shop.description ? (
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  {shop.description}
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Chat on WhatsApp
                </a>

                {shop.instagramHandle ? (
                  <div className="inline-flex rounded-lg border px-4 py-2 text-sm">
                    {shop.instagramHandle.startsWith("@")
                      ? shop.instagramHandle
                      : `@${shop.instagramHandle}`}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">Products</h2>

          {shop.products.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-muted-foreground shadow-sm">
              No products available yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shop.products.map((product) => (
                <StorefrontProductCard
                  key={product.id}
                  shopName={shop.name}
                  shopSlug={shop.slug}
                  whatsappNumber={shop.whatsappNumber}
                  selectedQuantity={
                    selectedProductId === product.id ? selectedQuantity : 1
                  }
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: Number(product.price),
                    imageUrl: product.imageUrl,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

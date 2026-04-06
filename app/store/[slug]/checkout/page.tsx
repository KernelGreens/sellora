import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontCheckoutForm } from "@/components/storefront/storefront-checkout-form";
import { prisma } from "@/lib/prisma";

type StorefrontCheckoutPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ productId?: string | string[]; quantity?: string | string[] }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getInitialQuantity(value: string | undefined) {
  const parsed = Number.parseInt(value || "1", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export default async function StorefrontCheckoutPage({
  params,
  searchParams,
}: StorefrontCheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const productId = getSearchParamValue(query.productId);

  if (!productId) {
    notFound();
  }

  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      products: {
        where: {
          id: productId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
        },
        take: 1,
      },
    },
  });

  const product = shop?.products[0];

  if (!shop || !product) {
    notFound();
  }

  const initialQuantity = getInitialQuantity(getSearchParamValue(query.quantity));

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href={`/store/${shop.slug}`}
          className="mb-6 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Back to store
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <StorefrontCheckoutForm
            shopSlug={shop.slug}
            product={{
              id: product.id,
              name: product.name,
              price: Number(product.price),
              imageUrl: product.imageUrl,
            }}
            initialQuantity={initialQuantity}
          />

          <aside className="space-y-4">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Ordering from
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{shop.name}</h1>
              {product.description ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">What happens next</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>We save your order details so the seller can track it properly.</li>
                <li>You get a ready-made WhatsApp message with your order reference.</li>
                <li>The seller confirms availability and shares the next payment step.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// app/store/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontProductCard } from "@/components/storefront/storefront-product-card";

type StorefrontPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;

  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      whatsappNumber: true,
      instagramHandle: true,
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

  if (!shop) {
    notFound();
  }

  const whatsappHref = `https://wa.me/${shop.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 rounded-3xl border bg-white p-8 shadow-sm">
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
                {shop.instagramHandle}
              </div>
            ) : null}
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
                  whatsappNumber={shop.whatsappNumber}
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
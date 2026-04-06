import Link from "next/link";
import { formatNaira } from "@/lib/utils/currency";

type StorefrontProductCardProps = {
  shopName: string;
  shopSlug: string;
  whatsappNumber: string;
  selectedQuantity: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
  };
};

export function StorefrontProductCard({
  shopName,
  shopSlug,
  whatsappNumber,
  selectedQuantity,
  product,
}: StorefrontProductCardProps) {
  const normalizedPrice = Number(product.price) || 0;
  const safeQuantity =
    Number.isFinite(selectedQuantity) && selectedQuantity > 0
      ? Math.floor(selectedQuantity)
      : 1;

  const total = normalizedPrice * safeQuantity;

  const whatsappMessage = encodeURIComponent(
    `Hello,\n\nI want to place an order from ${shopName}.\n\nProduct: ${product.name}\nUnit Price: ${formatNaira(
      normalizedPrice
    )}\nQuantity: ${safeQuantity}\nTotal: ${formatNaira(
      total
    )}\n\nPlease how do I proceed?`
  );
  const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber.replace(
    /\D/g,
    ""
  )}&text=${whatsappMessage}`;
  const decrementHref = `/store/${shopSlug}?productId=${product.id}&quantity=${Math.max(
    1,
    safeQuantity - 1
  )}`;
  const incrementHref = `/store/${shopSlug}?productId=${product.id}&quantity=${safeQuantity + 1}`;
  const checkoutHref = `/store/${shopSlug}/checkout?productId=${product.id}&quantity=${safeQuantity}`;

  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="mb-4 aspect-square w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          No image yet
        </div>
      )}

      <h3 className="text-lg font-semibold">{product.name}</h3>

      {product.description ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {product.description}
        </p>
      ) : null}

      <p className="mt-4 text-lg font-bold">
        {formatNaira(normalizedPrice)}
      </p>

      <div className="mt-4">
        <label
          htmlFor={`quantity-${product.id}`}
          className="mb-2 block text-sm font-medium"
        >
          Quantity
        </label>

        <div className="flex items-center gap-2">
          <Link
            href={decrementHref}
            className="touch-manipulation rounded-lg border px-3 py-2 text-sm select-none"
            aria-label={`Decrease quantity for ${product.name}`}
          >
            -
          </Link>

          <input
            id={`quantity-${product.id}`}
            type="number"
            min={1}
            step={1}
            readOnly
            value={safeQuantity}
            className="w-20 rounded-lg border px-3 py-2 text-center"
          />

          <Link
            href={incrementHref}
            className="touch-manipulation rounded-lg border px-3 py-2 text-sm select-none"
            aria-label={`Increase quantity for ${product.name}`}
          >
            +
          </Link>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Total:{" "}
        <span className="font-medium text-foreground">
          {formatNaira(total)}
        </span>
      </p>

      <div className="mt-4 space-y-2">
        <Link
          href={checkoutHref}
          className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Continue Order
        </Link>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Quick Chat on WhatsApp
        </a>
      </div>
    </article>
  );
}

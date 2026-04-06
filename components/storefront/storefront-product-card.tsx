"use client";

import { useMemo, useState } from "react";

type StorefrontProductCardProps = {
  shopName: string;
  whatsappNumber: string;
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
  whatsappNumber,
  product,
}: StorefrontProductCardProps) {
  const normalizedPrice = Number(product.price) || 0;
  const [quantity, setQuantity] = useState<number>(1);

  const safeQuantity =
    Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

  const total = normalizedPrice * safeQuantity;

  function increaseQuantity() {
    setQuantity((prev) => prev + 1);
  }

  function decreaseQuantity() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }

  function handleQuantityChange(value: string) {
    if (value.trim() === "") {
      setQuantity(1);
      return;
    }

    const parsed = parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed < 1) {
      setQuantity(1);
      return;
    }

    setQuantity(parsed);
  }

  const whatsappLink = useMemo(() => {
    const message = encodeURIComponent(
      `Hello 👋

I want to place an order from ${shopName}.

Product: ${product.name}
Unit Price: ₦${normalizedPrice.toLocaleString()}
Quantity: ${safeQuantity}
Total: ₦${total.toLocaleString()}

Please how do I proceed?`
    );

    const phone = whatsappNumber.replace(/\D/g, "");
    return `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
  }, [shopName, product.name, normalizedPrice, safeQuantity, total, whatsappNumber]);

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
        ₦{normalizedPrice.toLocaleString()}
      </p>

      <div className="mt-4">
        <label
          htmlFor={`quantity-${product.id}`}
          className="mb-2 block text-sm font-medium"
        >
          Quantity
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decreaseQuantity}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            -
          </button>

          <input
            id={`quantity-${product.id}`}
            type="number"
            min={1}
            step={1}
            value={safeQuantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-20 rounded-lg border px-3 py-2 text-center"
          />

          <button
            type="button"
            onClick={increaseQuantity}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            +
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Total:{" "}
        <span className="font-medium text-foreground">
          ₦{total.toLocaleString()}
        </span>
      </p>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
      >
        Order on WhatsApp
      </a>
    </article>
  );
}
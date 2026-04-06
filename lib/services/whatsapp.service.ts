type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  unitPriceKobo: number;
  lineTotalKobo: number;
};

type BuildStorefrontOrderMessageInput = {
  shopName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderNumber: string;
  customerNote?: string | null;
  items: WhatsAppOrderItem[];
  subtotalKobo: number;
  whatsappNumber: string;
};

export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return trimmed;
  }

  if (digits.startsWith("234")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `+234${digits.slice(1)}`;
  }

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function toWhatsAppPhone(value: string) {
  return normalizePhoneNumber(value).replace(/\D/g, "");
}

export function formatNairaFromKobo(amountKobo: number) {
  return `₦${(amountKobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function buildStorefrontOrderMessage({
  shopName,
  customerName,
  customerPhone,
  deliveryAddress,
  orderNumber,
  customerNote,
  items,
  subtotalKobo,
}: Omit<BuildStorefrontOrderMessageInput, "whatsappNumber">) {
  const itemLines = items.flatMap((item) => [
    `- ${item.quantity} x ${item.name} (${formatNairaFromKobo(item.unitPriceKobo)} each)`,
    `  Line Total: ${formatNairaFromKobo(item.lineTotalKobo)}`,
  ]);

  return [
    `Hello ${shopName},`,
    "",
    "I just placed a new order on Sellora.",
    `Order Number: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Phone: ${customerPhone}`,
    "",
    "Items:",
    ...itemLines,
    "",
    `Subtotal: ${formatNairaFromKobo(subtotalKobo)}`,
    `Delivery / Pickup: ${deliveryAddress}`,
    ...(customerNote ? [`Note: ${customerNote}`] : []),
    "",
    "Please confirm availability and share the next payment step.",
  ].join("\n");
}

export function buildStorefrontOrderWhatsAppUrl(
  input: BuildStorefrontOrderMessageInput
) {
  const message = buildStorefrontOrderMessage(input);

  return `https://api.whatsapp.com/send?phone=${toWhatsAppPhone(
    input.whatsappNumber
  )}&text=${encodeURIComponent(message)}`;
}

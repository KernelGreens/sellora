export type SellerShopSettingsData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsappNumber: string;
  instagramHandle: string | null;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  storefrontUrl: string;
  summary: {
    totalProducts: number;
    activeProducts: number;
    customerCount: number;
    orderCount: number;
  };
};

export type ShopSettingsFormValues = {
  name: string;
  slug: string;
  description: string;
  whatsappNumber: string;
  instagramHandle: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  logoUrl: string;
  isActive: boolean;
};

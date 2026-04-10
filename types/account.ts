export type SellerAccountSettingsData = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  summary: {
    hasPhone: boolean;
    hasShop: boolean;
    activeStorefront: boolean;
    totalOrders: number;
    totalCustomers: number;
  };
  shop: null | {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    storefrontUrl: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type AccountSettingsFormValues = {
  fullName: string;
  email: string;
  phone: string;
};

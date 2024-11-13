import type { SKUId } from "@/config/site";

export interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

export interface PaymentMethod {
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };

  paypal?: {
    payerId?: string | null;
  };
}

export interface SubscriptionItem {
  priceId: string;
  productId: string;
  quantity: number;
}

export interface Offering {
  skuId: SKUId;
  productName: string;
  productType: "PLAN";
  interval?: string;
  currency: string;
  priceId?: string;
  discountedUnitAmount?: number;
  unitAmount: number;
}

export interface ResetPasswordPayload {
  id: string;
  hash: string;
}

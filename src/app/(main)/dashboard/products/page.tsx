// src/app/(main)/dashboard/products/page.tsx

import { DashboardPageWrapper } from "@/components/DashboardPageWrapper";
import ProductInfoForm from "@/components/product/ProductInfoForm";

export default function ProductsPage() {
  return (
    <div className="h-full w-full">
      <DashboardPageWrapper
        title="Product Information"
        subTitle="Enter your product details or auto-fill them from your website."
      >
        <ProductInfoForm />
      </DashboardPageWrapper>
    </div>
  );
} 
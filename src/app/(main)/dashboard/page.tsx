// src/app/(main)/dashboard/page.tsx

import MainDashboard from "@/components/MainDashboard";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Get the current session
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get the latest product for the user
  const latestProduct = await prisma.product.findFirst({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!latestProduct) {
    redirect('/dashboard/products/new');
  }

  return <MainDashboard productId={latestProduct.id} />;
}

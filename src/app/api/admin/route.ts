import { ALL_SKUS_BY_ID } from "@/config/site";
import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import crypto from "crypto";

import { type NextRequest, NextResponse } from "next/server";
const handler = async (req: NextRequest) => {
  const data = await req.json();

  if (data.type == "CREATE_ACTIVATION_CODE") {
    const sku = ALL_SKUS_BY_ID.get(data.id);
    Array.from(Array(data.quantity)).forEach(async (x, i) => {
      await prisma.activationCode.create({
        data: {
          code: crypto.randomBytes(12).toString("hex"),
          data: JSON.stringify({
            items: [
              {
                priceId: sku?.prices![0]?.id,
                productId: sku?.product.id,
                quantity: 1,
              },
            ],
          }),
        },
      });
    });

    return new NextResponse();
  }
};

export const POST = withMiddleware(handler);

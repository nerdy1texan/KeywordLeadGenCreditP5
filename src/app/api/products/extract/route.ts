// src/app/api/products/extract/route.ts

import { withMiddleware } from "@/lib/apiHelper";
import { extractProductInfo } from "@/lib/services/product";
import { getSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

export const GET = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    const productInfo = await extractProductInfo(url);
    return NextResponse.json(productInfo);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to extract product information" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}); 
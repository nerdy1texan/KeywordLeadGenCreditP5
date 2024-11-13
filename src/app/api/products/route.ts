// src/app/api/products/route.ts

import { withMiddleware } from "@/lib/apiHelper";
import { createProduct } from "@/lib/services/product";
import { productSchema } from "@/lib/validation/product";
import { getSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    console.log('Received product data:', JSON.stringify(data, null, 2));

    try {
      const validatedData = productSchema.parse(data);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      
      const product = await createProduct(session.user.id, validatedData);
      return NextResponse.json(product);
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: `Validation error: ${validationError.message}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: "Failed to save product information",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}); 
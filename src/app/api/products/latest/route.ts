import { withMiddleware } from "@/lib/apiHelper";
import { getLatestProductByUser } from "@/lib/services/product";
import { getSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

export const GET = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await getLatestProductByUser(session.user.id);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
});

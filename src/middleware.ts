import { type NextRequest, NextResponse } from "next/server";
import { ENV } from "@/env.mjs";

export const config = {
  matcher: "/",
};

export function middleware(req: NextRequest) {
  // If in maintenance mode, point the url pathname to the maintenance page
  if (ENV.MAINTENANCE_MODE == "true") {
    req.nextUrl.pathname = `/maintenance`;

    // Rewrite to the url
    return NextResponse.rewrite(req.nextUrl);
  }

  if (ENV.WAITLIST_MODE == "true") {
    req.nextUrl.pathname = `/waitlist`;
    return NextResponse.rewrite(req.nextUrl);
  }
}

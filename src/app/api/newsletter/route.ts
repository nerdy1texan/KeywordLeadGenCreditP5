import { SITE } from "@/config/site";
import { validateParseResult, withMiddleware } from "@/lib/apiHelper";
import { updateSubscriber } from "@/lib/subscriber";
import { newsletterSchema } from "@/lib/validation";
import { type NextRequest, NextResponse } from "next/server";
const handler = async (req: NextRequest) => {
  const result = newsletterSchema.safeParse({
    email: req.nextUrl.searchParams.get("email"),
    active: req.nextUrl.searchParams.get("active") === "true",
  });
  validateParseResult(result);

  if (result.success) {
    await updateSubscriber({
      email: result.data.email,
      active: result.data.active,
    });

    return new NextResponse(
      result.data.active
        ? `You've subscribed to ${SITE.name}`
        : `You've unsubscribed from ${SITE.name}`
    );
  }
};

export const GET = withMiddleware(handler);

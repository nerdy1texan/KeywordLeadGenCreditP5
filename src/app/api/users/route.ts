import { validateParseResult, withMiddleware } from "@/lib/apiHelper";
import { Unauthorized } from "@/lib/exceptions";
import { getSession } from "@/lib/session";
import { updateUser } from "@/lib/user";
import { userSchema } from "@/lib/validation";
import { type NextRequest, NextResponse } from "next/server";
const handler = async (req: NextRequest) => {
  const result = userSchema.safeParse(await req.json());
  validateParseResult(result);

  if (result.success) {
    const session = await getSession();
    if (session == null || !session.user) {
      throw new Unauthorized();
    }

    await updateUser(session.user.id, {
      name: result.data.name,
    });

    return new NextResponse();
  }
};

export const POST = withMiddleware(handler);

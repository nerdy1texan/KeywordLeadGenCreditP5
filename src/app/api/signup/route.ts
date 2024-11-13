import { validateParseResult, withMiddleware } from "@/lib/apiHelper";
import { UserAlreadyExistError } from "@/lib/exceptions";
import { createUserWithGroup, getUserByEmail } from "@/lib/user";
import { signUpSchema } from "@/lib/validation";
import { type NextRequest, NextResponse } from "next/server";
const handler = async (req: NextRequest) => {
  const result = signUpSchema.safeParse(await req.json());
  validateParseResult(result);

  if (result.success) {
    const existingUser = await getUserByEmail(result.data.email);

    if (existingUser) {
      throw new UserAlreadyExistError();
    }

    const { user } = await createUserWithGroup(result.data);
    return new NextResponse(
      JSON.stringify({
        user,
      })
    );
  }
};

export const POST = withMiddleware(handler);

import { validateParseResult, withMiddleware } from "@/lib/apiHelper";
import { getUser, updateUser } from "@/lib/user";
import { resetPasswordSchema } from "@/lib/validation";
import jwt from "jsonwebtoken";
import { compare, hash as encryption } from "bcryptjs";
import { ENV } from "@/env.mjs";
import { InvalidRequestError } from "@/lib/exceptions";
import type { ResetPasswordPayload } from "@/typings";
import { type NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const result = resetPasswordSchema.safeParse(await req.json());
  validateParseResult(result);

  if (result.success) {
    const { token, password } = result.data;

    try {
      const { id, hash } = jwt.verify(
        token,
        ENV.JWT_SECRET
      ) as ResetPasswordPayload;
      const user = await getUser(id);
      if (user == null || !user.password || hash != user.password) {
        throw new Error();
      }

      await updateUser(id, {
        password: await encryption(password, 10),
      });
    } catch {
      throw new InvalidRequestError(
        "Unable to reset your password, please try again"
      );
    }
  }

  return new NextResponse();
};

export const POST = withMiddleware(handler);

import { validateParseResult, withMiddleware } from "@/lib/apiHelper";
import { getUserByEmail } from "@/lib/user";
import { emailSchema } from "@/lib/validation";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/lib/email";
import ResetPassword from "@/emails/ResetPassword";
import { ENV } from "@/env.mjs";
import type { ResetPasswordPayload } from "@/typings";
import { type NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const result = emailSchema.safeParse(await req.json());
  validateParseResult(result);

  if (result.success) {
    const user = await getUserByEmail(result.data.email);
    if (user && user.password) {
      const token = jwt.sign(
        { id: user.id, hash: user.password } as ResetPasswordPayload,
        ENV.JWT_SECRET,
        {
          expiresIn: "30m",
        }
      );
      await sendEmail(
        "Password reset",
        result.data.email,
        ResetPassword({ baseURL: ENV.NEXT_PUBLIC_APP_URL, token })
      );
    } else {
      console.log(
        "No password to reset as the account is not created through email and password"
      );
    }
  }

  return new NextResponse();
};

export const POST = withMiddleware(handler);

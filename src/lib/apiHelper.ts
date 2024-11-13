import { type z } from "zod";
import { type APIError, InvalidRequestError } from "@/lib/exceptions";
import type { NextRequest, NextResponse } from "next/server";

export function validateParseResult(result: z.SafeParseReturnType<any, any>) {
  if (!result.success) {
    const { errors } = result.error;
    throw new InvalidRequestError(errors.length > 0 ? errors[0]?.message : "");
  }
}

export const withMiddleware =
  (handler: (req: NextRequest) => Promise<NextResponse | undefined>) =>
  async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: APIError | any) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.status ?? 500,
      });
    }
  };

import { type User } from "@prisma/client";
import { ROUTES } from "@/config/site";
import { ENV } from "@/env.mjs";
import type {
  IUserSchema,
  IEmail,
  IResetPasswordSchema,
  ISignUp,
} from "@/lib/validation";

export async function createCheckoutSession(
  ref: string,
  priceId?: string
): Promise<{ url: string }> {
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiSubscriptionsCheckout.path}`,
    {
      method: "POST",
      body: JSON.stringify(
        priceId
          ? {
              stripePriceId: priceId,
              quantity: 1,
              ref: ref,
            }
          : {
              ref: ref,
            }
      ),
      cache: "no-store",
    }
  );

  if (res.ok) {
    return await res.json();
  } else {
    return Promise.reject(await res.json());
  }
}

export async function signup(data: ISignUp): Promise<User> {
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiSignup.path}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (res.ok) {
    return await res.json();
  } else {
    return Promise.reject(await res.json());
  }
}

export async function updateUser(data: IUserSchema): Promise<void> {
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiUpdateUser.path}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return Promise.reject(await res.json());
  }
}

export async function requestResetPassword(data: IEmail): Promise<void> {
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiPasswordRequestReset.path}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return Promise.reject(await res.json());
  }
}

export async function resetPassword(data: IResetPasswordSchema): Promise<void> {
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiPasswordReset.path}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return Promise.reject(await res.json());
  }
}

export async function newsletter(email: string): Promise<void> {
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiNewsletter.path}?email=${email}&active=true`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return Promise.reject(await res.json());
  }
}

export async function adminAction(data: any): Promise<void> {
  const res = await fetch(`${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiAdmin.path}`, {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    return Promise.reject(await res.json());
  }
}

export async function redeem(data: any): Promise<void> {
  console.log("redeem");
  const res = await fetch(
    `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.apiRedeem.path}`,
    {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return Promise.reject(await res.json());
  }
}

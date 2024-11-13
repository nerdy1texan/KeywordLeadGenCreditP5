import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type React from "react";
import { SITE } from "@/config/site";
import { ENV } from "@/env.mjs";
import cookie from "cookie";

const transporter = nodemailer.createTransport(ENV.EMAIL_SERVER_CONNECTION_URL);

export async function sendEmail(
  subject: string,
  to: string,
  content: React.ReactElement,
  from?: string
) {
  const options = {
    from: from ?? SITE.sender,
    to,
    subject,
    html: render(content),
  };
  return transporter.sendMail(options);
}

export async function sendMagicLink({ email }: { email: string }) {
  const response = await fetch(`${SITE.url}/api/auth/csrf`);
  const setCookie = response.headers.get("set-cookie");

  if (setCookie) {
    const parsedCookie = cookie.parse(setCookie);
    delete parsedCookie.Path;
    delete parsedCookie.SameSite;
    const newCookie = Object.entries(parsedCookie)
      .map(([key, val]) => cookie.serialize(key, val))
      .join("; ");
    const csrfToken = (await response.json()).csrfToken;

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: newCookie,
      },
      body: new URLSearchParams({
        email: email,
        callbakUrl: SITE.url,
        redirect: "false",
        csrfToken,
        json: "true",
      }),
    };

    await fetch(`${SITE.url}/api/auth/signin/email`, fetchOptions);
  }
}

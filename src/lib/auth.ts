import { type NextAuthOptions, type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { ENV } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { type User as ExtendedUser } from "@prisma/client";
import { createGroup } from "@/lib/user";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/validation";
import { compare } from "bcryptjs";
import { sendEmail } from "@/lib/email";
import SendMagicLink from "@/emails/SendMagicLink";
import { SITE } from "@/config/site";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ExtendedUser & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }

      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: token.user as ExtendedUser,
      };
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: ENV.EMAIL_SERVER_CONNECTION_URL,
      from: SITE.sender,
      async sendVerificationRequest(params) {
        const { identifier, url, provider } = params;
        const { host } = new URL(url);
        const result = await sendEmail(
          `Your login link to ${host}`,
          identifier,
          SendMagicLink({ url: url }),
          provider.from
        );
        const failed = result.rejected.concat(result.pending).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
    GoogleProvider({
      clientId: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const creds = await signInSchema.parseAsync(credentials);

        const user = await prisma.user.findFirst({
          where: { email: creds.email },
        });

        const errorMessage = `Bad email or password, please retry or request for an email link`;
        if (!user || !user.password) {
          throw new Error(errorMessage);
        }

        const isValidPassword = await compare(creds.password, user.password);

        if (!isValidPassword) {
          throw new Error(errorMessage);
        }

        return user;
      },
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  secret: ENV.NEXTAUTH_SECRET,
  session: {
    // Set to jwt in order to CredentialsProvider works properly
    strategy: "jwt",
  },
  events: {
    async createUser(message) {
      const { user } = message;
      await createGroup(user as ExtendedUser);
    },
  },
};

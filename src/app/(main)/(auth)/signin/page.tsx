"use client";
import Link from "next/link";
import { EmailSignIn } from "@/components/EmailSignIn";
import GoogleSignIn from "@/components/GoogleSignIn";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { ROUTES } from "@/config/site";
import { MagicLinkSignIn } from "@/components/MagicLinkSignIn";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/components/Toaster";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function SignIn() {
  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();
  const error = searchParams ? searchParams.get("error") : null;
  const [errorMessage, setErrorMessage] = useState("");
  const t = useDictionary()["Common"];
  useEffect(() => {
    let message = "";
    if (error) {
      switch (error) {
        case "AccessDenied":
          message = "Access denied, pelase retry";
        case "Verification":
          message = "The token has expired or has already been used";
        case "Configuration":
        default:
          message = "There is a problem to authorize your account";
      }
    }

    setErrorMessage(message);
  }, []);

  useEffect(() => {
    if (session.data && session.data.user) {
      router.push(ROUTES.dashboard.path);
    }
  }, [session]);

  useEffect(() => {
    if (errorMessage) {
      notify({ message: errorMessage, type: "error" });
    }
  }, [errorMessage]);

  return (
    <div className="flex justify-center py-36 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-lg justify-center px-3 lg:px-10">
        <RainbowWrapper>
          <div className="w-full rounded-3xl bg-base-100 p-10">
            <div className="mb-6 flex flex-row items-center justify-between sm:mx-auto sm:w-full sm:max-w-md">
              <Link href={ROUTES.signin.path}>
                <h4 className="h4">{(t as any)[ROUTES.signin.title]}</h4>
              </Link>
              <div className="flex flex-row gap-2 text-sm text-gray-500">
                <div>{t["or"]}</div>
                <Link
                  href={ROUTES.signup.path}
                  className="font-medium text-primary"
                >
                  {t["create an account"]}
                </Link>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full">
                <GoogleSignIn />
              </div>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-gray-500" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-base-100 px-2 text-gray-500">
                  {t["or continue with the magic link"]}
                </span>
              </div>
            </div>
            <MagicLinkSignIn />
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-gray-500" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-base-100 px-2 text-gray-500">
                  {t["or sign in with email and password"]}
                </span>
              </div>
            </div>
            <EmailSignIn />
          </div>
        </RainbowWrapper>
      </div>
    </div>
  );
}

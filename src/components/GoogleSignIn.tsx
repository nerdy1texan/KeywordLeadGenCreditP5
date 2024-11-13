"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import SignInButton from "@/components/SignInButton";
import { ROUTES } from "@/config/site";
import { useDictionary } from "@/components/DictionaryProvider";

export default function GoogleSignIn() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const t = useDictionary()["Common"];

  return (
    <SignInButton
      className="w-full bg-gray-900 hover:bg-gray-600"
      icon={"/icons/google.png"}
      disabled={loading}
      text={t["Continue with Google"]}
      onClick={async () => {
        setLoading(true);
        const res = await signIn("google", {
          callbackUrl: searchParams?.get("ref") || ROUTES.dashboard.path,
        });

        setLoading(false);

        if (!res?.ok) {
        }
      }}
    />
  );
}

"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ROUTES } from "@/config/site";
import LoadingButton from "@/components/LoadingButton";
import clsx from "clsx";
import { useDictionary } from "@/components/DictionaryProvider";
import { type User } from "@prisma/client";

export default function MainHeaderButtonGroup({
  className,
}: {
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const t = useDictionary()["Common"];
  const session = useSession();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    if (session.data && session.data.user) {
      setUser(session.data.user);
    }
  }, [session]);
  return user ? (
    <>
      <LoadingButton
        className={clsx("btn rounded-lg font-bold", className)}
        loading={loading}
        loadingText={t["Loading"]}
        onClick={async () => {
          setLoading(true);
          await signOut();
          setLoading(false);
        }}
      >
        {t["Sign out"]}
      </LoadingButton>
      <Link
        className={clsx("btn btn-primary rounded-lg font-bold", className)}
        href={ROUTES.dashboard.path}
      >
        {(t as any)[ROUTES.dashboard.title]}
      </Link>
    </>
  ) : (
    <>
      <Link
        className={clsx("btn btn-primary rounded-lg font-bold", className)}
        href={ROUTES.signin.path}
      >
        {(t as any)[ROUTES.signin.title]}
      </Link>
      <Link
        className={clsx("btn rounded-lg font-bold", className)}
        href={ROUTES.signup.path}
      >
        {(t as any)[ROUTES.signup.title]}
      </Link>
    </>
  );
}

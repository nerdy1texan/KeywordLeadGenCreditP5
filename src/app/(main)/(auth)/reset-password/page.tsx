"use client";
import { useFormik } from "formik";
import Link from "next/link";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { ROUTES } from "@/config/site";
import { confirmPasswordSchema } from "@/lib/validation";
import { withZodSchema } from "formik-validator-zod";
import { notifyWhenDone } from "@/components/Toaster";
import LoadingButton from "@/components/LoadingButton";
import { useState } from "react";
import Alert from "@/components/Alert";
import { resetPassword } from "@/lib/fetcher";
import PasswordInput from "@/components/PasswordInput";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useDictionary()["Common"];
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: withZodSchema(confirmPasswordSchema),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (searchParams) {
          await notifyWhenDone(
            resetPassword({
              password: values.password,
              token: searchParams.get("token")!,
            })
          );
        }

        router.push(ROUTES.signin.path);
      } finally {
        setLoading(false);
      }
    },
  });

  if (!searchParams?.get("token")) {
    return notFound();
  }

  return (
    <div className="flex justify-center py-36 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-lg justify-center px-3 lg:px-10">
        <RainbowWrapper>
          <div className="w-full rounded-3xl bg-base-100 p-10">
            <div className="mb-6 flex justify-center sm:mx-auto sm:w-full sm:max-w-md">
              <Link href={ROUTES.signin.path}>
                <h4 className="h4">{t["Reset password"]}</h4>
              </Link>
            </div>
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <PasswordInput
                label={t["New password"]}
                handleChange={formik.handleChange}
                value={formik.values.password}
              />
              <PasswordInput
                label={t["Confirm password"]}
                name={"confirmPassword"}
                handleChange={formik.handleChange}
                value={formik.values.confirmPassword}
              />

              {formik.touched.password && formik.errors.password && (
                <Alert type="error">
                  <span>{formik.errors.password}</span>
                </Alert>
              )}
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <Alert type="error">
                    <span>{formik.errors.confirmPassword}</span>
                  </Alert>
                )}
              <LoadingButton loading={loading} loadingText={t["Loading"]}>
                {t["Save password"]}
              </LoadingButton>
            </form>
          </div>
        </RainbowWrapper>
      </div>
    </div>
  );
}

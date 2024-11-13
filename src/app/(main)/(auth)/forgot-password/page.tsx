"use client";
import { useFormik } from "formik";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { ROUTES } from "@/config/site";
import { emailSchema } from "@/lib/validation";
import { withZodSchema } from "formik-validator-zod";
import { notifyWhenDone } from "@/components/Toaster";
import EmailInput from "@/components/EmailInput";
import LoadingButton from "@/components/LoadingButton";
import { useState } from "react";
import Alert from "@/components/Alert";
import { requestResetPassword } from "@/lib/fetcher";
import Link from "next/link";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const t = useDictionary()["Common"];
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validate: withZodSchema(emailSchema),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await notifyWhenDone(
          requestResetPassword(values),
          "An email has been sent if the email is registered"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex justify-center py-36 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-lg justify-center px-3 lg:px-10">
        <RainbowWrapper>
          <div className="w-full rounded-3xl bg-base-100 p-10">
            <div className="mb-6 flex justify-center sm:mx-auto sm:w-full sm:max-w-md">
              <Link href={ROUTES.signin.path}>
                <h4 className="h4">{t["Forgot your password?"]}</h4>
              </Link>
            </div>
            <div className="relative my-6">
              <div className="relative flex justify-center text-sm">
                <div className="flex flex-row gap-2 text-sm text-gray-500">
                  <div>
                    {t["We will email you a link to reset your password"]}
                  </div>
                </div>
              </div>
            </div>
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <EmailInput
                handleChange={formik.handleChange}
                value={formik.values.email}
              />

              {formik.touched.email && formik.errors.email && (
                <Alert type="error">
                  <span>{formik.errors.email}</span>
                </Alert>
              )}
              <LoadingButton loading={loading} loadingText={t["Loading"]}>
                {t["Reset password"]}
              </LoadingButton>
            </form>
            <div className="relative my-6">
              <div className="relative flex justify-center text-sm">
                <span className="bg-base-100 px-2 text-gray-500">
                  {t["Remember your password?"]}{" "}
                  <Link
                    href={ROUTES.signin.path}
                    className="font-medium text-primary"
                  >
                    {t["Sign in"]}
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </RainbowWrapper>
      </div>
    </div>
  );
}

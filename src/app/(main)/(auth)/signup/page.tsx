"use client";
import { useFormik } from "formik";
import Link from "next/link";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import GoogleSignIn from "@/components/GoogleSignIn";
import LoadingButton from "@/components/LoadingButton";
import NameInput from "@/components/NameInput";
import PasswordInput from "@/components/PasswordInput";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { signUpSchema } from "@/lib/validation";
import { withZodSchema } from "formik-validator-zod";
import { signup } from "@/lib/fetcher";
import { notifyWhenDone } from "@/components/Toaster";
import Alert from "@/components/Alert";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/site";
import { useDictionary } from "@/components/DictionaryProvider";

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const t = useDictionary()["Common"];

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: withZodSchema(signUpSchema),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await notifyWhenDone(signup(values));
        router.push(searchParams?.get("ref") ?? ROUTES.signin.path);
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
            <div className="mb-6 flex flex-row items-center justify-between sm:mx-auto sm:w-full sm:max-w-md">
              <Link href={ROUTES.signup.path}>
                <h4 className="h4">{t["Sign up"]}</h4>
              </Link>
              <div className="flex flex-row gap-2 text-sm text-gray-500">
                <div>{t["or"]}</div>
                <Link
                  href={ROUTES.signin.path}
                  className="font-medium text-primary"
                >
                  {t["sign in"]}
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
                  {t["or"]}
                </span>
              </div>
            </div>
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <NameInput
                handleChange={formik.handleChange}
                value={formik.values.name}
              />
              <EmailInput
                handleChange={formik.handleChange}
                value={formik.values.email}
              />
              <PasswordInput
                handleChange={formik.handleChange}
                value={formik.values.password}
              />
              <div className="flex items-center justify-start">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="checkbox-primary checkbox checkbox-xs"
                    />
                    <span className="label-text ml-2">
                      {t["I agree with the"]}{" "}
                      <Link
                        href={ROUTES.terms.path}
                        className="font-medium text-primary"
                      >
                        {t["Terms and Conditions"]}
                      </Link>
                    </span>
                  </label>
                </div>
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="alert">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0 stroke-info"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>{formik.errors.email}</span>
                </div>
              )}
              {formik.touched.email && formik.errors.email && (
                <Alert type="error">
                  <span>{formik.errors.email}</span>
                </Alert>
              )}
              {formik.touched.password && formik.errors.password && (
                <Alert type="error">
                  <span>{formik.errors.password}</span>
                </Alert>
              )}
              <div>
                <LoadingButton loading={loading} loadingText={t["Loading"]}>
                  {t["Sign up"]}
                </LoadingButton>
              </div>
            </form>
          </div>
        </RainbowWrapper>
      </div>
    </div>
  );
}

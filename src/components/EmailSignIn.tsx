import { useFormik } from "formik";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import { withZodSchema } from "formik-validator-zod";
import LoadingButton from "@/components/LoadingButton";
import PasswordInput from "@/components/PasswordInput";
import { notifyWhenDone } from "@/components/Toaster";
import { ROUTES } from "@/config/site";
import Alert from "@/components/Alert";
import { signInSchema } from "@/lib/validation";
import { useDictionary } from "@/components/DictionaryProvider";

export function EmailSignIn() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const t = useDictionary()["Common"];

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: withZodSchema(signInSchema),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await notifyWhenDone(
          signIn("credentials", {
            ...values,
            redirect: false,
          }).then((res) => {
            if (res) {
              const { ok, error } = res;
              if (!ok && error) {
                throw Error(error);
              }
            }
          })
        );
        router.push(searchParams?.get("ref") ?? ROUTES.dashboard.path);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      <EmailInput
        handleChange={formik.handleChange}
        value={formik.values.email}
      />
      <PasswordInput
        handleChange={formik.handleChange}
        value={formik.values.password}
      />
      <div className="flex items-center justify-start">
        <div className="text-sm">
          <Link
            className="font-medium text-primary"
            href={ROUTES.forgotPassword.path}
          >
            {t["Forgot your password?"]}
          </Link>
        </div>
      </div>
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
        <LoadingButton
          loading={loading}
          className="btn btn-secondary w-full"
          loadingText="Loading"
        >
          {t["Sign in"]}
        </LoadingButton>
      </div>
    </form>
  );
}

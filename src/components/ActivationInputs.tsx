import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import { withZodSchema } from "formik-validator-zod";
import LoadingButton from "@/components/LoadingButton";
import { notifyWhenDone } from "@/components/Toaster";
import { ROUTES } from "@/config/site";
import Alert from "@/components/Alert";
import { activationSchema } from "@/lib/validation";
import { useDictionary } from "@/components/DictionaryProvider";
import { redeem } from "@/lib/fetcher";

export function ActivationInputs() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const t = useDictionary()["Common"];
  const code = searchParams?.get("code");
  const formik = useFormik({
    initialValues: {
      email: "",
      code: code ?? "",
    },
    validate: withZodSchema(activationSchema),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await notifyWhenDone(
          redeem({
            email: values.email,
            code: values.code,
          })
        );
        router.push(ROUTES.checkoutSuccess.path);
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
      <div>
        <label htmlFor="code" className="block text-sm font-medium">
          {t["Code"]}
        </label>
        <div className="mt-1">
          <input
            id="code"
            name="code"
            type="text"
            autoComplete="code"
            onChange={formik.handleChange}
            value={formik.values.code}
            required
            className="input input-bordered w-full"
          />
        </div>
      </div>
      {formik.touched.email && formik.errors.email && (
        <Alert type="error">
          <span>{formik.errors.email}</span>
        </Alert>
      )}
      {formik.touched.code && formik.errors.code && (
        <Alert type="error">
          <span>{formik.errors.code}</span>
        </Alert>
      )}
      <div>
        <LoadingButton
          loading={loading}
          className="btn btn-primary w-full"
          loadingText="Loading"
        >
          {t["Redeem Now"]}
        </LoadingButton>
      </div>
    </form>
  );
}

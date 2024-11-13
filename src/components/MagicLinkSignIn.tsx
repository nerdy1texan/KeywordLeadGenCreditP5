"use client";
import { useFormik } from "formik";
import { signIn } from "next-auth/react";
import { useState } from "react";
import EmailInput from "@/components/EmailInput";
import { withZodSchema } from "formik-validator-zod";
import LoadingButton from "@/components/LoadingButton";
import { notifyWhenDone } from "@/components/Toaster";
import Alert from "@/components/Alert";
import { emailSchema } from "@/lib/validation";
import { ChevronRight } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export function MagicLinkSignIn({
  presetEmail,
}: {
  presetEmail?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const t = useDictionary()["Common"];
  const formik = useFormik({
    initialValues: {
      email: presetEmail ?? "",
    },
    validate: withZodSchema(emailSchema),
    onSubmit: async (values) => {
      setLoading(true);

      try {
        await notifyWhenDone(
          signIn("email", {
            ...values,
            redirect: false,
          }),
          "A sign in link has been sent to your email address"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form className="space-y-6" onSubmit={formik.handleSubmit}>
      {presetEmail ? (
        <p>{presetEmail}</p>
      ) : (
        <EmailInput
          handleChange={formik.handleChange}
          value={formik.values.email}
        />
      )}

      {formik.touched.email && formik.errors.email && (
        <Alert type="error">
          <span>{formik.errors.email}</span>
        </Alert>
      )}
      <div>
        <LoadingButton loading={loading} loadingText="Loading">
          <>
            <p>{t["Get the Link"]}</p>
            <ChevronRight className="h-5 w-5" />
          </>
        </LoadingButton>
      </div>
    </form>
  );
}

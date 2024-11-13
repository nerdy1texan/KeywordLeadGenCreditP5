"use client";
import EmailInput from "@/components/EmailInput";
import { newsletter } from "@/lib/fetcher";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { emailSchema } from "@/lib/validation";
import { useState } from "react";
import LoadingButton from "@/components/LoadingButton";
import Alert from "@/components/Alert";
import { notifyWhenDone } from "@/components/Toaster";
import { useDictionary } from "@/components/DictionaryProvider";

export default function Newsletter() {
  const t = useDictionary()["Common"];
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validate: withZodSchema(emailSchema),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await notifyWhenDone(newsletter(values.email));
      } finally {
        setLoading(false);
      }
    },
  });
  return (
    <div className="flex flex-col items-center gap-3">
      <form
        className={"flex flex-wrap items-end gap-3"}
        onSubmit={formik.handleSubmit}
      >
        <EmailInput
          handleChange={formik.handleChange}
          value={formik.values.email}
          className="input input-bordered w-full flex-grow"
        />

        <LoadingButton
          className={"btn btn-primary"}
          loading={loading}
          loadingText="Loading"
        >
          {t["Subscribe"]}
        </LoadingButton>
      </form>
      {formik.touched.email && formik.errors.email && (
        <Alert type="error">
          <span>{formik.errors.email}</span>
        </Alert>
      )}
    </div>
  );
}

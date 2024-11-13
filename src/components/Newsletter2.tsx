"use client";
import { useDictionary } from "@/components/DictionaryProvider";
import { useState } from "react";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { emailSchema } from "@/lib/validation";
import { notifyWhenDone } from "@/components/Toaster";
import { newsletter } from "@/lib/fetcher";
import LoadingButton from "@/components/LoadingButton";

export default function Newsletter2() {
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
    <>
      <div className="relative my-10 flex items-center justify-center gap-10 before:h-px before:w-full before:border-b before:shadow-sm before:shadow-white/20 before:[border-image:linear-gradient(to_right,transparent,theme(colors.indigo.300/.8),transparent)1] after:h-px after:w-full after:border-b after:shadow-sm after:shadow-white/20 after:[border-image:linear-gradient(to_right,transparent,theme(colors.indigo.300/.8),transparent)1] dark:before:shadow-none dark:before:[border-image:linear-gradient(to_right,transparent,theme(colors.indigo.300/.16),transparent)1] dark:after:shadow-none dark:after:[border-image:linear-gradient(to_right,transparent,theme(colors.indigo.300/.16),transparent)1]">
        <div className="mx-auto w-full max-w-xs shrink-0">
          <form className="relative">
            <div
              className="absolute -inset-3 -z-10 rounded-lg bg-primary/15 before:absolute before:inset-y-0 before:left-0 before:w-[15px] 
              before:bg-[length:15px_15px] 
              before:bg-no-repeat 
              before:[background-image:radial-gradient(circle_at_center,theme(colors.gray.500)_1.5px,transparent_1.5px),radial-gradient(circle_at_center,theme(colors.gray.500)_1.5px,transparent_1.5px)] 
              before:[background-position:top_center,bottom_center] after:absolute after:inset-y-0 after:right-0 after:w-[15px] after:bg-[length:15px_15px] 
              after:bg-no-repeat after:[background-image:radial-gradient(circle_at_center,theme(colors.gray.500)_1.5px,transparent_1.5px),radial-gradient(circle_at_center,theme(colors.gray.500)_1.5px,transparent_1.5px)] 
              after:[background-position:top_center,bottom_center]"
              aria-hidden="true"
            />
            <div className="space-y-3">
              <div>
                <label className="sr-only" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500/70 dark:text-gray-400/70">
                    <svg
                      className="fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={14}
                    >
                      <path d="M14 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm0 12H2V5.723l5.504 3.145a.998.998 0 0 0 .992 0L14 5.723V12Zm0-8.58L8 6.849 2 3.42V2h12v1.42Z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    placeholder={t["Email address"]}
                    required
                    className="round-lg w-full rounded-lg px-4 py-4 pl-10 text-sm text-gray-600 placeholder-gray-400 dark:text-gray-300 dark:placeholder-gray-500"
                  />
                </div>
              </div>
              <div>
                <LoadingButton
                  className="shining btn w-full rounded-lg border border-transparent bg-gray-900 text-sm font-medium tracking-normal text-gray-100 shadow-lg transition hover:bg-primary"
                  loading={loading}
                  loadingText="Loading"
                >
                  {t["Join The Waitlist"]}
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

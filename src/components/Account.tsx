"use client";
import { type User } from "@prisma/client";
import { useFormik } from "formik";
import { DashboardPageWrapper } from "@/components/DashboardPageWrapper";
import { requestResetPassword, updateUser } from "@/lib/fetcher";
import { notifyWhenDone } from "@/components/Toaster";
import { useState } from "react";
import { Card } from "@/components/Card";
import Avatar from "@/components/Avatar";
import { withZodSchema } from "formik-validator-zod";
import { userSchema } from "@/lib/validation";
import LoadingButton from "@/components/LoadingButton";
import Dialog from "@/components/Dialog";
import { signOut } from "next-auth/react";

export function Account({ user }: { user: User }) {
  const [unsaved, setUnsaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const formik = useFormik({
    initialValues: {
      name: user.name ?? "",
    },
    validate: withZodSchema(userSchema),
    validateOnBlur: false,
    validateOnMount: false,
    validateOnChange: false,
    enableReinitialize: true,
    onSubmit: () => {
      setIsOpen(true);
      setLoading(true);
    },
  });

  const onClose = () => {
    setIsOpen(false);
    setLoading(false);
  };
  return (
    <DashboardPageWrapper title="Settings" subTitle="Modify your account info">
      <Card>
        <div className="mt-6 grid grid-cols-4 gap-6">
          <div className="col-span-4">
            <Avatar user={user} className="h-16 w-16 shadow-lg" />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="text"
              name="email"
              id="email"
              value={user.email!}
              autoComplete="email"
              className="input input-bordered mt-1 block w-full sm:text-sm"
              disabled
            />
          </div>

          <div className="col-span-4 sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              value={formik.values.name}
              onChange={async (e) => {
                setUnsaved(true);
                await formik.setFieldValue("name", e.target.value);
              }}
              className="input input-bordered mt-1 block w-full sm:text-sm"
              required
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Reset Password (Available only if you sign up with a password)
            </label>
            <div
              className="btn btn-primary btn-outline btn-sm mt-3"
              onClick={async () => {
                await notifyWhenDone(
                  requestResetPassword({ email: user.email! })
                );
              }}
            >
              Send reset link
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-2 border-t border-base-200 pt-4">
          <LoadingButton
            onClick={formik.handleSubmit}
            loading={loading}
            className="btn btn-neutral btn-sm gap-2"
            disabled={!unsaved}
          >
            {"Save"}
          </LoadingButton>
        </div>
      </Card>
      <Dialog
        isOpen={isOpen}
        title={"Update account info"}
        content={"You are about to be signed out for account changes"}
        action={
          <button
            type="button"
            className="btn btn-primary btn-sm font-medium"
            onClick={async () => {
              try {
                await notifyWhenDone(updateUser(formik.values));
                await signOut();
              } finally {
                onClose();
              }
            }}
          >
            Update & Sign out
          </button>
        }
        onClose={onClose}
      />
    </DashboardPageWrapper>
  );
}

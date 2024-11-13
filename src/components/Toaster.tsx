"use client";

import toast, {
  Toaster as ReactHotToast,
  type ToastOptions,
} from "react-hot-toast";

export default function Toaster() {
  return <ReactHotToast position="bottom-center" />;
}

export type ToastType = "success" | "error" | "loading" | "blank" | "custom";

export function notify(message: { message: string; type: ToastType }) {
  toast(message.message, {
    type: message.type,
    style: { maxWidth: 500 },
  } as ToastOptions);
}

export async function notifyWhenDone<T>(
  promise: Promise<T>,
  success = "success",
  error = "error"
) {
  return toast.promise<T>(promise, {
    loading: "Loading...",
    success: () => {
      return <b>{success}</b>;
    },
    error: (err) => {
      console.log(err);
      return <b>{err.message ?? error}</b>;
    },
  });
}

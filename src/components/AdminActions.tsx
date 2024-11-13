"use client";
import { adminAction } from "@/lib/fetcher";
import LoadingButton from "@/components/LoadingButton";
import { ReactNode, useState } from "react";
import { ALL_SKUS_BY_ID, DEFAULT_PRICE_TYPE, DEFAULT_SKU } from "@/config/site";
import { notifyWhenDone } from "@/components/Toaster";

const ActionWrapper = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div className="border-color space-y-6 rounded-xl border border-primary p-6">
      {children}
    </div>
  );
};

export default function AdminActions() {
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(DEFAULT_SKU.id);
  const isDisabled = DEFAULT_PRICE_TYPE != "one_time";
  return (
    <div className="flex">
      <ActionWrapper title="Create Activation Key">
        <select
          className="select select-bordered w-full max-w-xs"
          value={id}
          onChange={(e) => setId(e.target.value)}
        >
          {Array.from(ALL_SKUS_BY_ID.keys()).map((id, index) => {
            return <option key={index}>{id}</option>;
          })}
        </select>
        <LoadingButton
          className="btn btn-primary btn-sm w-full"
          loading={loading}
          disabled={isDisabled}
          onClick={async () => {
            setLoading(true);
            try {
              await notifyWhenDone(
                adminAction({
                  type: "CREATE_ACTIVATION_CODE",
                  quantity: 100,
                  id: id,
                })
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {isDisabled
            ? "Available for one_time product"
            : "Batch create activation key"}
        </LoadingButton>
      </ActionWrapper>
    </div>
  );
}

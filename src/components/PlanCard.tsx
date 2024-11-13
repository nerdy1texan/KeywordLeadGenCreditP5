"use client";
import clsx from "clsx";
import { CURRENCY_TO_SYMBOL, ALL_SKUS_BY_ID } from "@/config/site";
import { createCheckoutSession } from "@/lib/fetcher";
import { notifyWhenDone } from "@/components/Toaster";
import { type Offering } from "@/typings";
import LoadingButton from "@/components/LoadingButton";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDictionary } from "@/components/DictionaryProvider";
import { ChevronRight } from "lucide-react";

export default function PlanCard({
  planOffering,
  isCurrent,
  popular,
}: {
  planOffering: Offering;
  popular?: boolean;
  isCurrent?: boolean;
}) {
  const router = useRouter();
  const ref = usePathname();
  const skuConfig = ALL_SKUS_BY_ID.get(planOffering.skuId)!;
  const [loading, setLoading] = useState(false);
  const t = useDictionary()["PlanCard"];

  return (
    <div
      className={clsx(
        "flex h-full transform cursor-pointer flex-col rounded-lg bg-base-200/60 p-6 shadow shadow-slate-950/5 transition-colors duration-300",
        popular && "border-2 border-primary"
      )}
    >
      {popular && (
        <div className="absolute right-0 top-0 -mt-4 mr-6">
          <div className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm shadow-slate-950/5">
            {t["mostPopular"]}
          </div>
        </div>
      )}
      <p className={"text-lg font-medium text-base-content"}>
        {planOffering.productName}
      </p>

      <h4 className={"h3 mt-2 text-base-content"}>
        {planOffering.unitAmount != 0 ? (
          <div className="inline-block">
            {planOffering.discountedUnitAmount && (
              <span className={"h4 mr-1 text-gray-400 line-through"}>
                {CURRENCY_TO_SYMBOL[planOffering.currency.toUpperCase()]! +
                  Math.round(planOffering.unitAmount / 100).toFixed(2)}
              </span>
            )}
            <span>
              {CURRENCY_TO_SYMBOL[planOffering.currency.toUpperCase()]! +
                Math.round(
                  (planOffering.discountedUnitAmount
                    ? planOffering.discountedUnitAmount
                    : planOffering.unitAmount) / 100
                ).toFixed(2)}
            </span>
          </div>
        ) : (
          "Free"
        )}
        {planOffering.interval && (
          <span className={"text-base font-normal text-base-content"}>
            {" "}
            / {planOffering.interval}
          </span>
        )}
      </h4>

      <p className={"mt-4 text-slate-500"}>{skuConfig.for}</p>

      {isCurrent ? (
        <button className="btn btn-secondary mt-10 w-full transform rounded-md font-bold capitalize tracking-wide">
          {t["yourCurrentPlan"]}
        </button>
      ) : (
        <LoadingButton
          loading={loading}
          loadingText="Loading"
          onClick={async () => {
            setLoading(true);
            try {
              const { url } = await notifyWhenDone(
                createCheckoutSession(ref ?? "", planOffering.priceId)
              );
              router.push(url);
            } finally {
              setLoading(false);
            }
          }}
          className="group btn btn-primary mt-10 w-full transform gap-2 rounded-md font-bold capitalize tracking-wide"
        >
          {t["choosePlan"]}
          <ChevronRight className="h-5 w-5 transition-all duration-300 ease-out group-hover:translate-x-1" />
        </LoadingButton>
      )}

      <div className="mt-8 flex-grow space-y-8">
        {skuConfig.features.map((feature, index) => {
          return (
            <div className="flex items-center" key={index}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>

              <span className={clsx("mx-4 text-base-content")}>{feature}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

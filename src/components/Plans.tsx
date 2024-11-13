"use client";
import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { useState } from "react";
import {
  DEFAULT_PRICE_TYPE,
  DEFAULT_CURRENCY,
  type PriceInterval,
} from "@/config/site";
import { listAvailableOfferings } from "@/lib/utils";
import { type Offering } from "@/typings";
import PlanCard from "@/components/PlanCard";

export default function Plans({
  currentPlanOffering,
}: {
  currentPlanOffering?: Offering;
}) {
  const recurringIntervals: PriceInterval[] = ["month", "year"];
  const [interval, setInterval] = useState<PriceInterval | undefined>(
    DEFAULT_PRICE_TYPE == "recurring" ? recurringIntervals[1]! : undefined
  );
  const plans = listAvailableOfferings({
    currency: DEFAULT_CURRENCY,
    interval: interval,
  });

  return (
    <div>
      {interval && (
        <div className="mb-12 flex items-center justify-center gap-3">
          <h4
            className={clsx(
              interval == recurringIntervals[0] && "text-primary",
              "h4"
            )}
          >
            {recurringIntervals[0]}
          </h4>
          <Switch
            checked={interval != recurringIntervals[0]}
            onChange={() => {
              setInterval(
                interval == recurringIntervals[0]
                  ? recurringIntervals[1]
                  : recurringIntervals[0]
              );
            }}
            className={clsx(
              interval != recurringIntervals[0] ? "bg-primary" : "bg-base-300",
              "relative inline-flex h-[32px] w-[66px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75"
            )}
          >
            <span className="sr-only">Switch billing interval</span>
            <span
              aria-hidden="true"
              className={clsx(
                interval != recurringIntervals[0]
                  ? "translate-x-9"
                  : "translate-x-0",
                "pointer-events-none inline-block h-[28px] w-[28px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
              )}
            />
          </Switch>
          <h4
            className={clsx(
              interval != recurringIntervals[0] && "text-primary",
              "h4"
            )}
          >
            {recurringIntervals[1]}
          </h4>
        </div>
      )}

      <div className="flex flex-col justify-center gap-6 sm:gap-8 md:flex-row">
        {plans.map((plan, index) => {
          return (
            <div className={`w-full md:w-1/${plans.length}`} key={index}>
              <PlanCard
                planOffering={plan}
                popular={index == plans.length - 1}
                isCurrent={currentPlanOffering?.skuId == plan.skuId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { type Subscription } from "@prisma/client";
import { CURRENCY_TO_SYMBOL, DEFAULT_SKU } from "@/config/site";
import { createCheckoutSession } from "@/lib/fetcher";
import { getCurrentPlanOffering } from "@/lib/utils";
import { type PaymentMethod } from "@/typings";
import { notifyWhenDone } from "@/components/Toaster";
import { ChevronRight } from "lucide-react";
import Plans from "@/components/Plans";
import { Card } from "@/components/Card";
import { usePathname, useRouter } from "next/navigation";

export default function ManageSubscription({
  subscription,
  paymentMethod,
}: {
  subscription?: Subscription;
  paymentMethod?: PaymentMethod;
}) {
  const router = useRouter();
  const ref = usePathname();

  const planOffering = getCurrentPlanOffering(subscription);

  const getPaymentMethodDetails = (paymentMethod: PaymentMethod): string[] => {
    if (paymentMethod.card) {
      return [
        paymentMethod.card.brand.toUpperCase() +
          " ends with " +
          paymentMethod.card.last4,
        "Expires in " +
          paymentMethod.card.expMonth.toString() +
          " / " +
          paymentMethod.card.expYear.toString(),
      ];
    }

    if (paymentMethod.paypal) {
      return [paymentMethod.paypal.payerId!, ""];
    }

    return ["Click here to manage your payment method", ""];
  };

  const getPaymentMethodIcon = (paymentMethod: PaymentMethod): any => {
    let icon = "default";
    if (paymentMethod.card && paymentMethod.card?.brand) {
      icon = paymentMethod.card.brand;
    } else if (paymentMethod.paypal) {
      icon = "paypal";
    }
    return (
      <img
        width={64}
        className="shrink-0"
        src={`/icons/payments/${icon}.svg`}
        alt="payment method"
      />
    );
  };

  const onClick = async () => {
    if (subscription) {
      const { url } = await notifyWhenDone(createCheckoutSession(ref ?? ""));
      router.push(url);
    } else {
      (window as any).plan_comparison_modal.showModal();
    }
  };
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="col-span-2 flex flex-col sm:col-span-1">
          <div className="h6">My Plan</div>
          <Card
            className="tooltip relative my-3 flex h-full items-center"
            tooltip={"Change your plan"}
            onClick={onClick}
          >
            <div className="flex-grow space-y-3">
              <div className="border-color flex items-center gap-3">
                {planOffering ? (
                  <>
                    <div className="font-bold">{planOffering.productName}</div>
                    {planOffering.interval && (
                      <div className="rounded-md bg-blue-200 px-2 py-1 font-semibold text-blue-600">
                        {planOffering.interval}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="font-bold">{DEFAULT_SKU.name}</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {planOffering && planOffering.currency ? (
                  <>
                    <div className="font-bold">
                      {CURRENCY_TO_SYMBOL[
                        planOffering.currency.toUpperCase()!
                      ]! + (planOffering.unitAmount / 100).toFixed(2)}
                    </div>
                    {subscription &&
                      subscription.externalCurrentPeriodEnd != null && (
                        <div className="text-gray-400">
                          {"next renewal at " +
                            subscription.externalCurrentPeriodEnd?.toISOString()}
                        </div>
                      )}
                  </>
                ) : (
                  <div className="rounded-md bg-base-200 px-2 py-1 font-bold text-primary">
                    {"Free"}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 cursor-pointer">
              <ChevronRight className="h-5 w-5 text-base-200" />
            </div>
          </Card>
        </div>

        {paymentMethod && (
          <div className="col-span-2 flex flex-col sm:col-span-1">
            <div className="h6">Payment Method</div>
            <Card
              className="tooltip relative my-3 flex h-full items-center gap-6"
              tooltip={"Change your payment method"}
              onClick={onClick}
            >
              <div className="border-color flex flex-shrink-0 items-center gap-3">
                <div className="font-bold">
                  {getPaymentMethodIcon(paymentMethod)}
                </div>
              </div>
              <div className="items-center gap-3 text-left text-left">
                <div className="font-bold">
                  {getPaymentMethodDetails(paymentMethod)[0]}
                </div>
                <div className="text-gray-400">
                  {getPaymentMethodDetails(paymentMethod)[1]}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      <dialog
        id="plan_comparison_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box min-h-fit min-w-fit">
          <Plans currentPlanOffering={planOffering} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

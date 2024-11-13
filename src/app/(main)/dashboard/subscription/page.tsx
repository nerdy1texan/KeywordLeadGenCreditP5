import { DashboardPageWrapper } from "@/components/DashboardPageWrapper";
import ManageSubscription from "@/components/ManageSubscription";
import { getSession } from "@/lib/session";
import { getSubscriptionAndPaymentMethod } from "@/lib/subscriptions";
import { notFound } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (session == null) {
    return notFound();
  }

  const { subscription, paymentMethod } = await getSubscriptionAndPaymentMethod(
    session.user
  );
  return (
    <div className="h-full w-full">
      <DashboardPageWrapper
        title="Subscription"
        subTitle="Update your payment information or change your plan."
      >
        <ManageSubscription
          subscription={subscription}
          paymentMethod={paymentMethod}
        />
      </DashboardPageWrapper>
    </div>
  );
}

import AdminActions from "@/components/AdminActions";
import { DashboardPageWrapper } from "@/components/DashboardPageWrapper";
import { getSession, isAdmin } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (session == null || !isAdmin(session.user)) {
    return notFound();
  }

  return (
    <div className="h-full w-full">
      <DashboardPageWrapper
        title="Admin"
        subTitle={"Current Admin: " + (process.env.ADMIN_EMAIL ?? "")}
      >
        <AdminActions />
      </DashboardPageWrapper>
    </div>
  );
}

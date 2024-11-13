import { Account } from "@/components/Account";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (session == null) {
    return notFound();
  }
  return (
    <div className="h-full w-full">
      <Account user={session.user} />
    </div>
  );
}

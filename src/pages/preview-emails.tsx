import ResetPassword from "@/emails/ResetPassword";
import SendMagicLink from "@/emails/SendMagicLink";

export default function Components() {
  return (
    <div>
      <ResetPassword showContentOnly token="" baseURL="" />
      <SendMagicLink showContentOnly url="" />
    </div>
  );
}

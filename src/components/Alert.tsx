import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

type MessageType = "info" | "success" | "warning" | "error";

export default function Alert({
  type,
  children,
}: {
  children: React.ReactNode;
  type: MessageType;
}) {
  const getIconByType = (type: MessageType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 />;
      case "warning":
        return <AlertCircle />;
      case "error":
        return <XCircle />;
      case "info":
      default:
        return <Info />;
    }
  };
  return (
    <div className={`alert alert-${type}`}>
      {<div className="shrink-0">{getIconByType(type)}</div>}
      {children}
    </div>
  );
}

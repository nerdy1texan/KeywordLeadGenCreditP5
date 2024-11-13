import { SITE } from "@/config/site";
import { Button, Hr, Link, Text } from "@react-email/components";
import * as React from "react";
import EmailTemplate, {
  anchor,
  button,
  hr,
  paragraph,
} from "@/emails/EmailTemplate";

export const ResetPassword = ({
  baseURL,
  token,
  showContentOnly,
}: {
  baseURL: string;
  token: string;
  showContentOnly?: boolean;
}) => {
  return (
    <EmailTemplate
      showContentOnly={showContentOnly}
      preview={`Reset your ${SITE.name} password`}
    >
      <Text style={paragraph}>
        We received your request to reset your password. No changes have been
        made to your account yet.
      </Text>
      <Text style={paragraph}>
        You can reset your password by clicking the link below:
      </Text>
      <Button style={button} href={`${baseURL}/reset-password?token=${token}`}>
        Reset Password
      </Button>
      <Hr style={hr} />
      <Text style={paragraph}>
        If you did not initiate this request, please let us know immediately at{" "}
        <Link style={anchor} href={`mailto:${SITE.email}`}>
          {SITE.email}
        </Link>
        .
      </Text>
    </EmailTemplate>
  );
};

export default ResetPassword;

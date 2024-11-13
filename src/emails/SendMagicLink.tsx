import { SITE } from "@/config/site";
import { Button, Hr, Link, Text } from "@react-email/components";
import * as React from "react";
import EmailTemplate, {
  anchor,
  button,
  hr,
  paragraph,
} from "@/emails/EmailTemplate";

export const SendMagicLink = ({
  url,
  showContentOnly,
}: {
  url: string;
  showContentOnly?: boolean;
}) => {
  return (
    <EmailTemplate
      showContentOnly={showContentOnly}
      preview={`Login to ${SITE.name}`}
    >
      <Text style={paragraph}>
        Please click the button below to log in to your account.
      </Text>
      <Button style={button} href={url}>
        Login to your account
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

export default SendMagicLink;

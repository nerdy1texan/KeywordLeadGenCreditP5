import { SITE } from "@/config/site";
import { ENV } from "@/env.mjs";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const EmailTemplate = ({
  preview,
  children,
  showContentOnly,
}: {
  preview: string;
  children: React.ReactNode;
  showContentOnly?: boolean;
}) => {
  const content = (
    <Container style={container}>
      <Section style={box}>
        <Img src={`${ENV.NEXT_PUBLIC_APP_URL}/logo_light.png`} height="25" />
        <Hr style={hr} />
        {children}
        <Text style={paragraph}>— The {SITE.name} Team</Text>
        <Hr style={hr} />
        {SITE.address && <Text style={footer}>{SITE.address}</Text>}
      </Section>
    </Container>
  );
  return showContentOnly ? (
    content
  ) : (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>{content}</Body>
    </Html>
  );
};

export default EmailTemplate;

const main = {};

const container = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

export const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

export const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

export const anchor = {
  color: "#556cd6",
};

export const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  padding: "8px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

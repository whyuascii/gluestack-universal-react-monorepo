import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface InviteProps {
  inviterName: string;
  tenantName: string;
  inviteLink: string;
  // i18n props
  i18n_greeting?: string;
  i18n_body?: string;
  i18n_cta?: string;
  i18n_expiry?: string;
  i18n_ignore?: string;
  i18n_footer?: string;
}

export function InviteToTenant({
  inviterName,
  tenantName,
  inviteLink,
  i18n_greeting,
  i18n_body,
  i18n_cta,
  i18n_expiry,
  i18n_ignore,
  i18n_footer,
}: InviteProps) {
  // Fallback to English defaults if i18n props not provided
  const greeting = i18n_greeting || "Hi,";
  const body = i18n_body || `${inviterName} has invited you to join ${tenantName}.`;
  const cta = i18n_cta || "Accept Invitation";
  const expiry = i18n_expiry || "This invitation will expire in 7 days.";
  const ignore = i18n_ignore || "If you don't want to join, you can safely ignore this email.";

  return (
    <Html>
      <Head />
      <Preview>{body}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{cta}</Heading>

          <Text style={text}>{greeting}</Text>

          <Text style={text}>{body}</Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              {cta}
            </Button>
          </Section>

          <Text style={text}>Or copy and paste this URL into your browser:</Text>
          <Text style={link}>{inviteLink}</Text>

          <Text style={warning}>{expiry}</Text>

          <Text style={footer}>{ignore}</Text>

          {i18n_footer && <Text style={footerBrand}>{i18n_footer}</Text>}
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const buttonContainer = {
  padding: "27px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#4CAF50",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px 0",
  margin: "0 auto",
};

const link = {
  color: "#4CAF50",
  fontSize: "14px",
  textDecoration: "underline",
  padding: "0 40px",
  wordBreak: "break-all" as const,
};

const warning = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "20px 40px 0",
  textAlign: "center" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "20px 40px 0",
};

const footerBrand = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "20px",
  padding: "20px 40px",
  textAlign: "center" as const,
  borderTop: "1px solid #e6e6e6",
  marginTop: "20px",
};

export default InviteToTenant;

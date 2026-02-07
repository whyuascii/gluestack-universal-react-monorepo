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

interface AdminInviteProps {
  name?: string;
  adminRole: "read_only" | "support_rw" | "super_admin";
  inviteLink: string;
  appName?: string;
  // i18n props
  i18n_greeting?: string;
  i18n_body?: string;
  i18n_bodyDetails?: string;
  i18n_cta?: string;
  i18n_expiry?: string;
  i18n_ignore?: string;
  i18n_footer?: string;
  i18n_roleLabel?: string;
}

const ROLE_LABELS: Record<string, string> = {
  read_only: "Read-Only Admin",
  support_rw: "Support Admin",
  super_admin: "Super Admin",
};

export function AdminInviteEmail({
  name,
  adminRole,
  inviteLink,
  appName = "App",
  i18n_greeting,
  i18n_body,
  i18n_bodyDetails,
  i18n_cta,
  i18n_expiry,
  i18n_ignore,
  i18n_footer,
  i18n_roleLabel,
}: AdminInviteProps) {
  const roleLabel = i18n_roleLabel || ROLE_LABELS[adminRole] || adminRole;
  const greeting = i18n_greeting || (name ? `Hi ${name},` : "Hi,");
  const body =
    i18n_body || `You've been invited to join the ${appName} admin team as a ${roleLabel}.`;
  const bodyDetails =
    i18n_bodyDetails ||
    "As an admin, you'll have access to the internal dashboard to help manage users and support our community.";
  const cta = i18n_cta || "Accept Invitation";
  const expiry = i18n_expiry || "This invitation will expire in 7 days.";
  const ignore =
    i18n_ignore || "If you weren't expecting this invitation, you can safely ignore this email.";

  return (
    <Html>
      <Head />
      <Preview>{body}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to the Team!</Heading>

          <Text style={text}>{greeting}</Text>

          <Text style={text}>{body}</Text>

          <Section style={roleBox}>
            <Text style={roleTitle}>Your Role</Text>
            <Text style={roleName}>{roleLabel}</Text>
          </Section>

          <Text style={text}>{bodyDetails}</Text>

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
  color: "#1a1a2e",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0 20px",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const roleBox = {
  backgroundColor: "#f0f4f8",
  borderRadius: "8px",
  margin: "20px 40px",
  padding: "16px 24px",
  textAlign: "center" as const,
};

const roleTitle = {
  color: "#666",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px 0",
};

const roleName = {
  color: "#1a1a2e",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const buttonContainer = {
  padding: "27px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "220px",
  padding: "14px 0",
  margin: "0 auto",
};

const link = {
  color: "#6366f1",
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

export default AdminInviteEmail;

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionActivatedProps {
  name: string;
  planName: string;
  dashboardLink: string;
  i18n_greeting?: string;
  i18n_body?: string;
  i18n_cta?: string;
  i18n_footer?: string;
}

export function SubscriptionActivated({
  name,
  planName,
  dashboardLink,
  i18n_greeting,
  i18n_body,
  i18n_cta,
  i18n_footer,
}: SubscriptionActivatedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription is now active</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Subscription Activated</Heading>

          <Text style={text}>{i18n_greeting || `Hi ${name},`}</Text>

          <Text style={text}>
            {i18n_body ||
              `Thank you for subscribing to ${planName}! Your subscription is now active and you have full access to all premium features.`}
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardLink}>
              {i18n_cta || "Go to Dashboard"}
            </Button>
          </Section>

          <Text style={footer}>{i18n_footer || "Thank you for your support!"}</Text>
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

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "20px 40px 0",
  textAlign: "center" as const,
};

export default SubscriptionActivated;

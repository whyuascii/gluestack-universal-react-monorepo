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

interface WelcomeProps {
  name: string;
  dashboardLink: string;
  // i18n props
  i18n_greeting?: string;
  i18n_body?: string;
  i18n_cta?: string;
  i18n_support?: string;
  i18n_footer?: string;
}

export function AuthWelcome({
  name,
  dashboardLink,
  i18n_greeting,
  i18n_body,
  i18n_cta,
  i18n_support,
  i18n_footer,
}: WelcomeProps) {
  // Fallback to English defaults if i18n props not provided
  const greeting = i18n_greeting || `Welcome, ${name}!`;
  const body = i18n_body || "Thank you for joining us. We're excited to have you on board.";
  const cta = i18n_cta || "Get Started";
  const support =
    i18n_support || "If you have any questions, feel free to reach out to our support team.";

  return (
    <Html>
      <Head />
      <Preview>{body}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{greeting}</Heading>

          <Text style={text}>{body}</Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardLink}>
              {cta}
            </Button>
          </Section>

          <Text style={footer}>{support}</Text>

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

export default AuthWelcome;

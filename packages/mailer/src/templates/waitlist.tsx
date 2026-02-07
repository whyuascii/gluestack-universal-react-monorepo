import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import * as React from "react";

interface WaitlistWelcomeProps {
  name: string;
  unsubscribeLink?: string;
  // i18n props
  i18n_title?: string;
  i18n_greeting?: string;
  i18n_body1?: string;
  i18n_body2?: string;
  i18n_body3?: string;
  i18n_unsubscribe?: string;
  i18n_footer?: string;
}

export function WaitlistWelcome({
  name,
  unsubscribeLink,
  i18n_title,
  i18n_greeting,
  i18n_body1,
  i18n_body2,
  i18n_body3,
  i18n_unsubscribe,
  i18n_footer,
}: WaitlistWelcomeProps) {
  // Fallback to English defaults if i18n props not provided
  const title = i18n_title || "You're on the list!";
  const greeting = i18n_greeting || `Hi ${name},`;
  const body1 =
    i18n_body1 ||
    "Thanks for joining our waitlist! We're building something special and can't wait to share it with you.";
  const body2 =
    i18n_body2 ||
    "We'll keep you updated on our progress and let you know as soon as we're ready for you to try.";
  const body3 =
    i18n_body3 ||
    "In the meantime, feel free to reply to this email with any questions or feedback!";
  const unsubscribeText = i18n_unsubscribe || "Unsubscribe from waitlist updates";

  return (
    <Html>
      <Head />
      <Preview>{body1}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{title}</Heading>

          <Text style={text}>{greeting}</Text>

          <Text style={text}>{body1}</Text>

          <Text style={text}>{body2}</Text>

          <Text style={text}>{body3}</Text>

          {unsubscribeLink && (
            <Text style={footer}>
              <a href={unsubscribeLink} style={unsubscribeStyle}>
                {unsubscribeText}
              </a>
            </Text>
          )}

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

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "24px",
  padding: "20px 40px 0",
  textAlign: "center" as const,
};

const unsubscribeStyle = {
  color: "#8898aa",
  textDecoration: "underline",
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

export default WaitlistWelcome;

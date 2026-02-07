import { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how we collect, use, and protect your personal information.",
};

const LAST_UPDATED = "February 2, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        <strong>Effective Date:</strong> {LAST_UPDATED}
      </p>

      <p>
        This Privacy Policy describes how <strong>[COMPANY_NAME]</strong> (&quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares information about you when
        you use our website, mobile application, and other online products and services
        (collectively, the &quot;Services&quot;).
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide</h3>
      <p>We collect information you provide directly to us, such as when you:</p>
      <ul>
        <li>Create an account (email address, name, password)</li>
        <li>Update your profile or account settings</li>
        <li>Subscribe to our services</li>
        <li>Contact us for support</li>
        <li>Participate in surveys or promotions</li>
      </ul>

      <h3>1.2 Automatically Collected Information</h3>
      <p>
        We use <strong>cookieless analytics</strong> to understand how our Services are used. This
        means we do NOT store cookies on your device for analytics purposes. Instead, we use
        privacy-preserving techniques that include:
      </p>
      <ul>
        <li>Anonymized page view counts</li>
        <li>Aggregated usage patterns</li>
        <li>Device type and browser information (anonymized)</li>
        <li>Approximate geographic region (country-level only)</li>
      </ul>
      <p>
        Our analytics provider (PostHog) uses a server-side hash that combines your IP address with
        a daily-rotating salt. This hash cannot be reversed to identify you, and the salt is deleted
        after processing. This approach complies with GDPR and similar privacy regulations.
      </p>

      <h3>1.3 Essential Cookies</h3>
      <p>
        We only use cookies that are strictly necessary for the operation of our Services, such as:
      </p>
      <ul>
        <li>Authentication session cookies (to keep you logged in)</li>
        <li>Security cookies (to prevent cross-site request forgery)</li>
      </ul>
      <p>
        These essential cookies cannot be disabled as they are required for the Services to
        function.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our Services</li>
        <li>Process transactions and send related information</li>
        <li>Send you technical notices, updates, and support messages</li>
        <li>Respond to your comments, questions, and requests</li>
        <li>Monitor and analyze trends, usage, and activities</li>
        <li>Detect, investigate, and prevent fraudulent transactions and abuse</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Information Sharing</h2>
      <p>We do not sell your personal information. We may share information as follows:</p>
      <ul>
        <li>
          <strong>Service Providers:</strong> With vendors who perform services on our behalf
          (hosting, email delivery, payment processing, analytics)
        </li>
        <li>
          <strong>Legal Requirements:</strong> When required by law or to protect our rights
        </li>
        <li>
          <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of
          assets
        </li>
        <li>
          <strong>With Your Consent:</strong> When you direct us to share information
        </li>
      </ul>

      <h3>3.1 Third-Party Services</h3>
      <p>We use the following third-party services:</p>
      <ul>
        <li>
          <strong>PostHog</strong> - Privacy-focused analytics (cookieless mode)
        </li>
        <li>
          <strong>Resend</strong> - Transactional email delivery
        </li>
        <li>
          <strong>RevenueCat</strong> - Subscription management
        </li>
        <li>
          <strong>Novu</strong> - Notification delivery
        </li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        We retain your personal information for as long as necessary to provide our Services and
        fulfill the purposes described in this policy. When you delete your account, we will delete
        or anonymize your personal information within 30 days, except where we are required to
        retain it for legal purposes.
      </p>

      <h2>5. Your Rights</h2>
      <p>Depending on your location, you may have the following rights:</p>
      <ul>
        <li>
          <strong>Access:</strong> Request a copy of your personal data
        </li>
        <li>
          <strong>Correction:</strong> Request correction of inaccurate data
        </li>
        <li>
          <strong>Deletion:</strong> Request deletion of your data
        </li>
        <li>
          <strong>Portability:</strong> Request a machine-readable copy of your data
        </li>
        <li>
          <strong>Objection:</strong> Object to processing of your data
        </li>
        <li>
          <strong>Restriction:</strong> Request restriction of processing
        </li>
      </ul>
      <p>
        To exercise these rights, contact us at <strong>[COMPANY_EMAIL]</strong>. We will respond
        within 30 days.
      </p>

      <h2>6. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other than your own. We
        ensure appropriate safeguards are in place to protect your information in compliance with
        applicable data protection laws.
      </p>

      <h2>7. Children&apos;s Privacy</h2>
      <p>
        Our Services are not directed to children under 13 (or 16 in the EEA). We do not knowingly
        collect personal information from children. If you believe we have collected information
        from a child, please contact us immediately.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new policy on this page and updating the &quot;Last updated&quot; date.
      </p>

      <h2>9. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us at:</p>
      <ul>
        <li>
          Email: <strong>[COMPANY_EMAIL]</strong>
        </li>
        <li>
          Address: <strong>[COMPANY_ADDRESS]</strong>
        </li>
      </ul>
    </LegalPageLayout>
  );
}

import { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using our services.",
};

const LAST_UPDATED = "February 2, 2026";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p>
        <strong>Effective Date:</strong> {LAST_UPDATED}
      </p>

      <p>
        Please read these Terms of Service (&quot;Terms&quot;) carefully before using the services
        provided by
        <strong> [COMPANY_NAME]</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
        accessing or using our website, mobile application, or any other services (collectively, the
        &quot;Services&quot;), you agree to be bound by these Terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using our Services, you acknowledge that you have read,
        understood, and agree to be bound by these Terms and our Privacy Policy. If you do not
        agree, you may not use our Services.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 13 years old (or 16 in the EEA) to use our Services. By using our
        Services, you represent that you meet these age requirements and have the legal capacity to
        enter into these Terms.
      </p>

      <h2>3. Account Registration</h2>
      <p>To access certain features, you must create an account. You agree to:</p>
      <ul>
        <li>Provide accurate, current, and complete information</li>
        <li>Maintain and update your information as needed</li>
        <li>Keep your password secure and confidential</li>
        <li>Accept responsibility for all activity under your account</li>
        <li>Notify us immediately of any unauthorized access</li>
      </ul>

      <h2>4. Subscriptions and Payments</h2>

      <h3>4.1 Subscription Plans</h3>
      <p>
        We offer subscription-based access to premium features. Subscription details, including
        pricing and features, are displayed at the time of purchase.
      </p>

      <h3>4.2 Billing</h3>
      <p>
        By subscribing, you authorize us to charge your payment method on a recurring basis (monthly
        or annually, depending on your plan) until you cancel.
      </p>

      <h3>4.3 No Refund Policy</h3>
      <p>
        <strong>ALL PURCHASES ARE FINAL AND NON-REFUNDABLE.</strong> This includes but is not
        limited to:
      </p>
      <ul>
        <li>Monthly subscription fees</li>
        <li>Annual subscription fees</li>
        <li>One-time purchases</li>
        <li>In-app purchases</li>
        <li>Partial subscription periods</li>
      </ul>
      <p>
        If you cancel your subscription, you will continue to have access to premium features until
        the end of your current billing period. No prorated refunds will be issued for unused time.
      </p>
      <p>
        <strong>Exceptions:</strong> Refunds may be issued at our sole discretion in cases of:
      </p>
      <ul>
        <li>Duplicate charges due to technical errors</li>
        <li>Unauthorized transactions (subject to investigation)</li>
        <li>Service unavailability exceeding 7 consecutive days</li>
      </ul>

      <h3>4.4 Price Changes</h3>
      <p>
        We may change subscription prices at any time. Price changes will take effect at the start
        of your next billing period. We will provide at least 30 days&apos; notice before any price
        increase.
      </p>

      <h3>4.5 Cancellation</h3>
      <p>
        You may cancel your subscription at any time through your account settings. Cancellation
        takes effect at the end of the current billing period.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate any applicable laws or regulations</li>
        <li>Infringe on intellectual property rights of others</li>
        <li>Upload or transmit viruses, malware, or harmful code</li>
        <li>Attempt to gain unauthorized access to our systems</li>
        <li>Interfere with or disrupt the Services</li>
        <li>Harass, abuse, or harm other users</li>
        <li>Use the Services for any illegal or unauthorized purpose</li>
        <li>Create multiple accounts to abuse promotions or circumvent restrictions</li>
        <li>Reverse engineer, decompile, or disassemble the Services</li>
        <li>Use automated systems (bots, scrapers) without permission</li>
      </ul>

      <h2>6. User Content</h2>

      <h3>6.1 Your Content</h3>
      <p>
        You retain ownership of content you create or upload to the Services. By submitting content,
        you grant us a worldwide, non-exclusive, royalty-free license to use, store, and display
        your content solely for the purpose of providing the Services.
      </p>

      <h3>6.2 Content Removal</h3>
      <p>
        We reserve the right to remove any content that violates these Terms or that we deem
        inappropriate, without prior notice.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        The Services, including all content, features, and functionality, are owned by
        [COMPANY_NAME] and are protected by copyright, trademark, and other intellectual property
        laws. You may not copy, modify, distribute, or create derivative works without our express
        written permission.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES
        OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>
      <p>We do not warrant that:</p>
      <ul>
        <li>The Services will be uninterrupted or error-free</li>
        <li>Defects will be corrected</li>
        <li>The Services are free of viruses or harmful components</li>
        <li>The results of using the Services will meet your requirements</li>
      </ul>

      <h2>9. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, [COMPANY_NAME] SHALL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS
        OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICES
        SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless [COMPANY_NAME] and its officers,
        directors, employees, and agents from any claims, damages, losses, or expenses (including
        reasonable attorneys&apos; fees) arising from your use of the Services or violation of these
        Terms.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may suspend or terminate your account at any time, with or without cause, with or without
        notice. Upon termination:
      </p>
      <ul>
        <li>Your right to use the Services immediately ceases</li>
        <li>We may delete your account and data</li>
        <li>No refunds will be issued for any remaining subscription period</li>
      </ul>
      <p>
        You may terminate your account at any time by contacting us or using the account deletion
        feature in settings.
      </p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of
        <strong> [JURISDICTION]</strong>, without regard to its conflict of law provisions. Any
        disputes arising from these Terms shall be resolved exclusively in the courts of
        [JURISDICTION].
      </p>

      <h2>13. Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will notify you of material
        changes by posting the updated Terms on our website and updating the &quot;Last
        updated&quot; date. Your continued use of the Services after changes become effective
        constitutes acceptance of the new Terms.
      </p>

      <h2>14. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable, the remaining provisions will
        continue in full force and effect.
      </p>

      <h2>15. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy and any other policies referenced herein,
        constitute the entire agreement between you and [COMPANY_NAME] regarding the Services.
      </p>

      <h2>16. Contact Us</h2>
      <p>For questions about these Terms, please contact us at:</p>
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

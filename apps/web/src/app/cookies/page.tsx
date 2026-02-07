import { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about our privacy-first approach to cookies and tracking.",
};

const LAST_UPDATED = "February 2, 2026";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated={LAST_UPDATED}>
      <p>
        <strong>Effective Date:</strong> {LAST_UPDATED}
      </p>

      <p>
        This Cookie Policy explains how <strong>[COMPANY_NAME]</strong> (&quot;we,&quot;
        &quot;us,&quot; or &quot;our&quot;) uses cookies and similar technologies. We are committed
        to protecting your privacy and have designed our Services to minimize data collection.
      </p>

      <h2>1. Our Privacy-First Approach</h2>
      <p>
        Unlike most websites,{" "}
        <strong>we do not use cookies for analytics or tracking purposes</strong>. We have
        implemented a &quot;cookieless&quot; analytics approach that allows us to understand how our
        Services are used without storing any tracking cookies on your device.
      </p>
      <p>
        This means you will never see a cookie consent banner on our website asking for permission
        to track you, because we simply don&apos;t do that kind of tracking.
      </p>

      <h2>2. How Our Cookieless Analytics Works</h2>
      <p>
        We use PostHog, a privacy-focused analytics platform, configured in &quot;cookieless
        mode.&quot; Here&apos;s how it works:
      </p>
      <ul>
        <li>
          <strong>No cookies stored:</strong> We never store analytics cookies on your device
        </li>
        <li>
          <strong>No local storage:</strong> We don&apos;t use browser storage for tracking
        </li>
        <li>
          <strong>Server-side hashing:</strong> To count unique visitors, PostHog creates a
          privacy-preserving hash on their servers using your IP address and a daily-rotating salt
        </li>
        <li>
          <strong>Irreversible:</strong> This hash cannot be reversed to identify you
        </li>
        <li>
          <strong>Daily reset:</strong> The salt changes daily, so you appear as a new visitor each
          day (we cannot track you across days)
        </li>
      </ul>

      <h3>2.1 What This Means for You</h3>
      <ul>
        <li>We cannot identify individual users through analytics</li>
        <li>We cannot track you across different days or sessions</li>
        <li>We cannot link your activity across different devices</li>
        <li>Your privacy is protected while we still get aggregate usage data</li>
      </ul>

      <h2>3. Essential Cookies We Do Use</h2>
      <p>
        While we don&apos;t use tracking cookies, we do use a small number of cookies that are
        strictly necessary for our Services to function. These cannot be disabled.
      </p>

      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                Cookie Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Purpose</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code className="bg-gray-100 px-1 rounded">session</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                Keeps you logged in to your account
              </td>
              <td className="border border-gray-300 px-4 py-2">Session / 30 days</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code className="bg-gray-100 px-1 rounded">csrf_token</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                Protects against cross-site request forgery attacks
              </td>
              <td className="border border-gray-300 px-4 py-2">Session</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Third-Party Services</h2>
      <p>
        Our Services integrate with third-party providers that may have their own cookie policies:
      </p>
      <ul>
        <li>
          <strong>Payment Processors:</strong> When you make a payment, you may be redirected to a
          payment provider (e.g., Stripe) that uses its own cookies
        </li>
        <li>
          <strong>App Stores:</strong> If you download our mobile app, Apple or Google may use
          cookies on their platforms
        </li>
      </ul>
      <p>We encourage you to review the privacy policies of these third parties.</p>

      <h2>5. Managing Cookies in Your Browser</h2>
      <p>
        Although we minimize cookie usage, you can control cookies through your browser settings:
      </p>
      <ul>
        <li>
          <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
        </li>
        <li>
          <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data
        </li>
        <li>
          <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
        </li>
        <li>
          <strong>Edge:</strong> Settings → Cookies and site permissions → Cookies
        </li>
      </ul>
      <p>
        <strong>Note:</strong> Blocking all cookies may prevent you from logging in to our Services,
        as authentication requires session cookies.
      </p>

      <h2>6. Do Not Track</h2>
      <p>
        Some browsers offer a &quot;Do Not Track&quot; (DNT) setting. Because we already use
        cookieless analytics that doesn&apos;t track individual users, our Services inherently
        respect DNT principles.
      </p>

      <h2>7. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Any changes will be posted on this page
        with an updated &quot;Last updated&quot; date.
      </p>

      <h2>8. Contact Us</h2>
      <p>If you have questions about our use of cookies, please contact us at:</p>
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

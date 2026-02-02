import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Cedular",
  description: "Privacy Policy for Cedular - AI-assisted scheduling that keeps Gmail, meetings, and calendars in sync.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Link href="/" className="text-muted-foreground hover:text-primary transition text-sm flex items-center gap-1 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This Privacy Policy describes how Cedular collects, uses, and discloses your personal information when you use our application.
      </p>
      <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
      <p className="mb-4">
        When you connect your Google account to Cedular, we collect your email address and access your Gmail and Google Calendar data (with your explicit consent) to provide our core scheduling services. This includes:
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>Your email address</li>
        <li>Read-only access to your Gmail messages for scheduling intent detection</li>
        <li>Access to your Google Calendar to check availability, create, update, and cancel events</li>
      </ul>
      <p className="mb-4">
        We do not collect any other personal identifiable information beyond what is necessary to provide and improve our services.
      </p>

      <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use the collected information solely for the purpose of providing AI-assisted scheduling services:
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>To automatically detect scheduling requests from your emails</li>
        <li>To find optimal meeting times and propose them</li>
        <li>To create, update, reschedule, and cancel calendar events on your behalf</li>
        <li>To sync scheduling information between your emails and calendar</li>
      </ul>
      <p className="mb-4">
        We do not use your information for advertising, selling to third parties, or any purpose other than what is explicitly stated here.
      </p>

      <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
      <p className="mb-4">
        We are committed to protecting your data. We implement appropriate technical and organizational measures to safeguard your personal information against unauthorized access, disclosure, alteration, or destruction. All data is stored securely and access is restricted to authorized personnel only.
      </p>

      <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
      <p className="mb-4">
        We retain your personal information only for as long as necessary to provide the services you have requested and for legitimate and essential business purposes, such as maintaining the performance of the Cedular app, making data-driven business decisions about new features, and complying with our legal obligations.
      </p>

      <h2 className="text-2xl font-semibold mb-4">5. Third-Party Access</h2>
      <p className="mb-4">
        We do not share your personal information with third parties except as necessary to provide our services (e.g., Google Calendar API, Gmail API). All third-party services we use are vetted for their security and privacy practices.
      </p>

      <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
      <p className="mb-4">
        You have the right to access, correct, or delete your personal information held by Cedular. If you wish to exercise these rights, please contact us at [Your Support Email Here].
      </p>

      <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
      <p className="mb-4">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us at hi@adarsha.dev.
      </p>
    </div>
  );
}

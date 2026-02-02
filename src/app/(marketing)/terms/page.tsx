// src/app/(marketing)/terms/page.tsx
import React from 'react';
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Link href="/" className="text-muted-foreground hover:text-primary transition text-sm flex items-center gap-1 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        Welcome to Cedular! These Terms of Service (&quot;Terms&quot;) govern your use of the Cedular application and services. By accessing or using Cedular, you agree to be bound by these Terms.
      </p>

      <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By using Cedular, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use our services.
      </p>

      <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
      <p className="mb-4">
        Cedular provides an AI-assisted scheduling service that integrates with your Google account (Gmail and Google Calendar) to automatically schedule, confirm, reschedule, and cancel meetings based on your email communications. Our service aims to minimize manual effort in coordinating meetings.
      </p>

      <h2 className="text-2xl font-semibold mb-4">3. Google Account Integration</h2>
      <p className="mb-4">
        To use Cedular, you must connect your Google account. By doing so, you grant Cedular access to your Gmail messages (read-only for scheduling intent detection) and Google Calendar (to manage events). You retain full control over these permissions and can revoke them at any time through your Google account settings.
      </p>

      <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
      <p className="mb-4">
        You are responsible for:
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>Maintaining the confidentiality of your account information</li>
        <li>Ensuring that your use of Cedular complies with all applicable laws and regulations</li>
        <li>Providing accurate and up-to-date information for scheduling preferences</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
      <p className="mb-4">
        You agree not to use Cedular for any unlawful or prohibited activities, including but not limited to:
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>Sending unsolicited communications (spam)</li>
        <li>Attempting to gain unauthorized access to our systems or other users&apos; accounts</li>
        <li>Interfering with the proper functioning of the service</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">6. Disclaimer of Warranties</h2>
      <p className="mb-4">
        Cedular is provided &quot;as is&quot; and &quot;as available&quot; without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or completely secure.
      </p>

      <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
      <p className="mb-4">
        To the fullest extent permitted by law, Cedular shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the service; (b) any conduct or content of any third party on the service; (c) any content obtained from the service; and (d) unauthorized access, use, or alteration of your transmissions or content.
      </p>

      <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
      </p>

      <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about these Terms, please contact us at hi@adarsha.dev.
      </p>
    </div>
  );
}

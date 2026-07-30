import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Tembea, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.",
  },
  {
    title: "2. Use of the Platform",
    body: "Tembea is a marketplace connecting travelers with tourism service providers in Rwanda. You may use the platform for personal, non-commercial purposes unless you are a registered partner. You agree not to misuse the platform, submit false information, or violate any applicable laws.",
  },
  {
    title: "3. Account Registration",
    body: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.",
  },
  {
    title: "4. Bookings & Payments",
    body: "Bookings made through Tembea are subject to availability and partner confirmation. Prices are displayed in USD unless otherwise stated. Tembea facilitates payments but does not hold funds on behalf of partners beyond the transaction window.",
  },
  {
    title: "5. Cancellations & Refunds",
    body: "Cancellation and refund policies vary by partner and listing type. Each listing displays its specific cancellation policy before booking. Tembea may charge a service fee that is non-refundable in cases of voluntary cancellation.",
  },
  {
    title: "6. Partner Responsibilities",
    body: "Partners are responsible for the accuracy of their listings, delivery of services as described, and compliance with Rwandan law. Tembea reserves the right to remove listings or suspend partners who violate platform standards.",
  },
  {
    title: "7. Intellectual Property",
    body: "All content on Tembea, including logos, design, and text, is owned by Tembea or its licensors. You may not reproduce or distribute platform content without written permission.",
  },
  {
    title: "8. Limitation of Liability",
    body: "Tembea acts as a marketplace intermediary. We are not liable for the actions or omissions of partners or third-party service providers. Our liability is limited to the amount paid for the specific transaction in dispute.",
  },
  {
    title: "9. Changes to Terms",
    body: "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance. We will notify registered users of significant changes by email.",
  },
  {
    title: "10. Contact",
    body: "For questions about these Terms, contact us at legal@tembea.rw.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="tembea-container max-w-3xl">
        <div className="mb-10">
          <span className="section-kicker">Legal</span>
          <h1 className="text-4xl font-black text-gray-900 mt-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: June 2025 &nbsp;·&nbsp;{" "}
            <Link href="/privacy" className="text-[#145A32] font-semibold hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-8">
          <p className="text-gray-600 leading-relaxed">
            These Terms of Service govern your use of the Tembea platform, operated by Tembea Ltd, registered in Kigali, Rwanda.
            Please read them carefully before using our services.
          </p>

          {sections.map((s) => (
            <div key={s.title} className="space-y-2">
              <h2 className="text-lg font-black text-gray-900">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <PageLayout title="Privacy Policy" subtitle="Last updated: July 2, 2026">
      <div className="space-y-10">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          This Privacy Policy explains how VademAI ("we", "us", or "our") collects, uses, and protects
          your information when you use our website and application (the "Service"). By using VademAI you
          agree to the practices described here.
        </p>

        <Section title="1. Information we collect">
          <p>We collect the following categories of information:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li><strong>Account information</strong> — your name, email address, and password when you register.</li>
            <li><strong>Study content</strong> — documents you upload and the flashcards, questions, and plans generated from them.</li>
            <li><strong>Usage data</strong> — how you interact with the Service, collected via analytics to improve the product.</li>
            <li><strong>Technical data</strong> — device, browser, and log information.</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <p>We use your information to:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Provide, maintain, and improve the Service and its AI features;</li>
            <li>Authenticate you and keep your account secure;</li>
            <li>Generate study materials from the documents you upload;</li>
            <li>Communicate with you about your account and product updates;</li>
            <li>Understand usage trends and improve performance.</li>
          </ul>
        </Section>

        <Section title="3. AI processing">
          <p>
            To power features such as the AI tutor, flashcards, and exam mode, the text of documents you
            upload may be sent to third-party AI providers (for example, Anthropic) solely to generate your
            study materials. We do not sell your content, and we do not use it to train third-party models.
          </p>
        </Section>

        <Section title="4. How we share information">
          <p>
            We do not sell your personal information. We share it only with service providers who help us
            operate the Service (such as hosting, authentication, and AI processing), and only as needed to
            perform those services, or where required by law.
          </p>
        </Section>

        <Section title="5. Data retention">
          <p>
            We retain your information for as long as your account is active. You can delete individual
            documents at any time from your dashboard, and you may request deletion of your account and
            associated data by contacting us.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            Depending on your location, you may have the right to access, correct, export, or delete your
            personal data, and to object to or restrict certain processing. To exercise these rights,
            contact us using the details below.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use industry-standard measures to protect your data, including encryption in transit and
            access controls. No method of transmission or storage is completely secure, but we work hard to
            protect your information.
          </p>
        </Section>

        <Section title="8. Children's privacy">
          <p>
            The Service is intended for users aged 16 and over. We do not knowingly collect personal data
            from children under this age.
          </p>
        </Section>

        <Section title="9. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes will be posted on this
            page with an updated "Last updated" date.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p>
            Questions about this policy? Reach us via our{' '}
            <Link to="/contact" className="font-semibold text-brand hover:text-brand-600 dark:text-brand-400">contact page</Link>{' '}
            or at privacy@vademai.com.
          </p>
        </Section>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This document is a general template provided for informational purposes and is not legal advice.
        </p>
      </div>
    </PageLayout>
  )
}

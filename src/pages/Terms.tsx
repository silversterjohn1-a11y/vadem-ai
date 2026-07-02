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

export default function Terms() {
  return (
    <PageLayout title="Terms of Service" subtitle="Last updated: July 2, 2026">
      <div className="space-y-10">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          These Terms of Service ("Terms") govern your access to and use of VademAI (the "Service"). By
          creating an account or using the Service, you agree to these Terms. If you do not agree, please do
          not use the Service.
        </p>

        <Section title="1. Eligibility">
          <p>
            You must be at least 16 years old to use the Service. By using VademAI you represent that you
            meet this requirement and that the information you provide is accurate.
          </p>
        </Section>

        <Section title="2. Your account">
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all
            activity under your account. Notify us immediately of any unauthorised use.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Use the Service for any unlawful purpose or in violation of any regulation;</li>
            <li>Upload content you do not have the right to use;</li>
            <li>Attempt to disrupt, reverse-engineer, or gain unauthorised access to the Service;</li>
            <li>Resell or redistribute the Service without our written permission.</li>
          </ul>
        </Section>

        <Section title="4. Your content">
          <p>
            You retain ownership of the documents and materials you upload. You grant us a limited licence to
            process that content solely to provide the Service to you (for example, generating flashcards and
            questions). You are responsible for ensuring you have the rights to any content you upload.
          </p>
        </Section>

        <Section title="5. AI-generated content & medical disclaimer">
          <p>
            VademAI uses AI to generate study materials. AI output may be incomplete or inaccurate. The
            Service is a <strong>study aid, not medical advice</strong>. Always verify AI-generated content
            against trusted sources and never rely on it for clinical decisions or patient care.
          </p>
        </Section>

        <Section title="6. Plans and payment">
          <p>
            The Service offers a free plan and paid plans. Paid subscriptions are billed in advance on a
            recurring basis and renew automatically until cancelled. You may cancel at any time; cancellation
            takes effect at the end of the current billing period. Fees are non-refundable except where
            required by law.
          </p>
        </Section>

        <Section title="7. Termination">
          <p>
            You may stop using the Service and delete your account at any time. We may suspend or terminate
            access if you violate these Terms or use the Service in a way that could cause harm or legal
            liability.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind, whether
            express or implied, including fitness for a particular purpose and non-infringement.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the maximum extent permitted by law, VademAI will not be liable for any indirect, incidental,
            or consequential damages, or for any loss of data, arising from your use of the Service.
          </p>
        </Section>

        <Section title="10. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes take
            effect constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about these Terms? Reach us via our{' '}
            <Link to="/contact" className="font-semibold text-brand hover:text-brand-600 dark:text-brand-400">contact page</Link>{' '}
            or at legal@vademai.com.
          </p>
        </Section>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This document is a general template provided for informational purposes and is not legal advice.
        </p>
      </div>
    </PageLayout>
  )
}

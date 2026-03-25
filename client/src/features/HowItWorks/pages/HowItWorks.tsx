import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  GlobeLock,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  ChevronDown,
} from 'lucide-react';

import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import GuestNavbar from '../../../components/guest/GuestNavbar';
import './HowItWorks.css';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const HowItWorks: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('listing');
  const location = useLocation();
  const navigate = useNavigate();
  const appState = (location.state as { fromGuestHome?: boolean; fromAppNavbar?: boolean } | null) ?? null;
  const fromGuestHome = Boolean(appState?.fromGuestHome);
  const fromAppNavbar = Boolean(appState?.fromAppNavbar);

  const storedUserRole = (() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const parsed = JSON.parse(userStr) as { role?: string } | null;
      return parsed?.role ?? null;
    } catch {
      return null;
    }
  })();

  const isSignedIn = Boolean(localStorage.getItem('accessToken'));
  const hideSidebar = fromGuestHome || !fromAppNavbar || !isSignedIn || storedUserRole !== 'LANDLORD';

  useEffect(() => {
    // Keep users on the correct role page if they were routed here from the app navbar.
    if (!fromAppNavbar || !isSignedIn || storedUserRole !== 'TENANT') return;
    navigate('/for-tenants', { replace: true, state: { fromAppNavbar: true } });
  }, [navigate, fromAppNavbar, isSignedIn, storedUserRole]);

  const steps = useMemo(
    () => [
      {
        title: 'Create your landlord profile',
        description:
          'Set up your account in minutes so HOMi can verify listings and connect you with qualified tenants.',
        icon: <Sparkles size={22} />,
      },
      {
        title: 'List properties with clarity',
        description:
          'Publish rental details once, keep everything organized, and present a consistent experience for applicants.',
        icon: <Building2 size={22} />,
      },
      {
        title: 'Match with vetted tenants',
        description:
          'Use HOMi’s smart discovery to find the right tenants and reduce back-and-forth during screening.',
        icon: <Search size={22} />,
      },
      {
        title: 'Sign leases digitally',
        description:
          'Generate lease-ready documents and keep agreement history centralized—so contracts are always easy to reference.',
        icon: <FileText size={22} />,
      },
      {
        title: 'Manage payments & maintenance',
        description:
          'Track rent activity, handle maintenance requests, and keep communication in one place to speed up resolution.',
        icon: <Wrench size={22} />,
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        title: 'Trust & verification',
        description: 'Safer leasing with clearer records and secure, structured workflows.',
        icon: <ShieldCheck size={20} />,
      },
      {
        title: 'Payments made simple',
        description: 'Automate rent tracking and keep billing transparent for both sides.',
        icon: <CreditCard size={20} />,
      },
      {
        title: 'Central messaging',
        description: 'Communicate with tenants without losing context across emails and calls.',
        icon: <MessageSquare size={20} />,
      },
      {
        title: 'Privacy-aware onboarding',
        description: 'HOMi is built to handle sensitive rental data responsibly.',
        icon: <GlobeLock size={20} />,
      },
    ],
    []
  );

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: 'listing',
        question: 'How long does it take to list a property?',
        answer:
          'Most landlords can create a listing in a few minutes. Add basic details first, then refine photos and requirements as needed.',
      },
      {
        id: 'tenants',
        question: 'How does matching work?',
        answer:
          'HOMi helps connect landlords and tenants by aligning listing details with applicant intent—reducing time spent on unsuitable inquiries.',
      },
      {
        id: 'contracts',
        question: 'Can I manage lease documents in one place?',
        answer:
          'Yes. Contract history stays centralized so you can quickly access documents when renewing, troubleshooting, or verifying terms.',
      },
      {
        id: 'support',
        question: 'What if I need help during onboarding?',
        answer:
          'You can use the Help Center and support channels to get guidance. Start small with one property, then scale as you get comfortable.',
      },
    ],
    []
  );

  return (
    <div className={`how-page-layout ${hideSidebar ? 'how-page-layout--no-sidebar' : ''}`}>
      {!hideSidebar && <Sidebar />}

      <div className="how-main-content">
        {hideSidebar ? <GuestNavbar /> : <Header />}

        <main className="how-content" aria-label="How HOMi works for landlords">
          <section className="how-hero">
            <div className="how-hero-bg" aria-hidden="true" />

            <div className="how-hero-inner">
              <span className="how-badge">How it works</span>
              <h1>
                From listing to lease—<span>in one flow</span>
              </h1>
              <p>
                HOMi helps landlords manage rentals with transparency, organized workflows, and fast communication.
              </p>

              <div className="how-cta-row">
                <Link to="/auth" className="how-btn-primary">
                  Get started
                </Link>
                <Link to="/get-help" className="how-btn-secondary">
                  See how support works
                </Link>
              </div>

              <div className="how-hero-metrics" aria-label="Quick highlights">
                <div className="metric-pill">
                  <CheckCircle2 size={16} />
                  <span>Centralized documents</span>
                </div>
                <div className="metric-pill">
                  <CheckCircle2 size={16} />
                  <span>Maintenance tracking</span>
                </div>
                <div className="metric-pill">
                  <CheckCircle2 size={16} />
                  <span>Clear payment visibility</span>
                </div>
              </div>
            </div>
          </section>

          <section className="how-section how-steps" aria-label="Step by step">
            <div className="how-container">
              <div className="how-section-head">
                <h2>5 steps to manage your rentals</h2>
                <p>Every step is designed to reduce friction and help you lease faster.</p>
              </div>

              <div className="how-steps-grid">
                {steps.map((step, idx) => (
                  <div key={step.title} className="how-step-card">
                    <div className="how-step-top">
                      <div className="how-step-number" aria-hidden="true">
                        {idx + 1}
                      </div>
                      <div className="how-step-icon" aria-hidden="true">
                        {step.icon}
                      </div>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="how-section how-benefits" aria-label="Key benefits">
            <div className="how-container">
              <div className="how-section-head how-section-head--tight">
                <h2>Built for real landlord workflows</h2>
                <p>Everything you need to keep properties running smoothly.</p>
              </div>

              <div className="how-benefits-grid">
                {benefits.map((b) => (
                  <div key={b.title} className="how-benefit-card">
                    <div className="how-benefit-icon" aria-hidden="true">
                      {b.icon}
                    </div>
                    <h3>{b.title}</h3>
                    <p>{b.description}</p>
                  </div>
                ))}
              </div>

              <div className="how-two-col">
                <div className="how-callout how-callout--primary">
                  <div className="how-callout-icon" aria-hidden="true">
                    <ShieldCheck size={20} />
                  </div>
                  <h3>Verified, organized, and secure</h3>
                  <p>
                    Reduce chaos by keeping the rental journey structured—from listing details to contract history.
                  </p>
                </div>

                <div className="how-callout how-callout--secondary">
                  <div className="how-callout-icon" aria-hidden="true">
                    <MessageSquare size={20} />
                  </div>
                  <h3>Faster communication</h3>
                  <p>
                    Keep conversations and maintenance updates in one place, so you can resolve issues sooner.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="how-section how-faq" aria-label="FAQ">
            <div className="how-container">
              <div className="how-section-head">
                <h2>Landlord FAQ</h2>
                <p>Quick answers before you start.</p>
              </div>

              <div className="how-faq-grid">
                {faqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <button
                      key={faq.id}
                      type="button"
                      className={`how-faq-item ${isOpen ? 'open' : ''}`}
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="how-faq-question">{faq.question}</span>
                      <ChevronDown size={18} className="how-faq-chevron" aria-hidden="true" />
                      {isOpen && <span className="how-faq-answer">{faq.answer}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="how-faq-note">
                Not sure where to begin? Start with one property and use the Help Center whenever you need guidance.
              </div>
            </div>
          </section>

          <section className="how-section how-final-cta" aria-label="Final call to action">
            <div className="how-container">
              <div className="how-final-card">
                <div className="how-final-left">
                  <div className="how-final-badge">
                    <Sparkles size={18} />
                    Quick start
                  </div>
                  <h2>Ready to manage rentals end to end?</h2>
                  <p>Create your landlord account and streamline listing, tenant matching, contracts, payments, and maintenance.</p>
                </div>
                <div className="how-final-actions">
                  <Link to="/auth" className="how-btn-primary how-btn-primary--big">
                    Create landlord account
                  </Link>
                  <Link to="/for-tenants" className="how-btn-secondary how-btn-secondary--big">
                    Explore for tenants
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HowItWorks;


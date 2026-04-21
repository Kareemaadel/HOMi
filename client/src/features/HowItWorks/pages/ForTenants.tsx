import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  GlobeLock,
  Home,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  KeyRound,
} from 'lucide-react';

import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import GuestNavbar from '../../../components/guest/GuestNavbar';
import AuthModal from '../../../components/global/AuthModal';
import './ForTenants.css';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const ForTenants: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('apply');
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const hideSidebar = fromGuestHome || !fromAppNavbar || !isSignedIn || storedUserRole !== 'TENANT';

  useEffect(() => {
    // Keep users on the correct role page if they were routed here from the app navbar.
    if (!fromAppNavbar || !isSignedIn || storedUserRole !== 'LANDLORD') return;
    navigate('/for-landlords', { replace: true, state: { fromAppNavbar: true } });
  }, [navigate, fromAppNavbar, isSignedIn, storedUserRole]);

  const steps = useMemo(
    () => [
      {
        title: 'Create your tenant profile',
        description:
          'Set up your account once so you can apply faster, track requests, and manage rentals in one place.',
        icon: <Sparkles size={22} />,
      },
      {
        title: 'Browse and compare listings',
        description:
          'Filter by budget, location, and preferences to quickly find homes that match your lifestyle.',
        icon: <Search size={22} />,
      },
      {
        title: 'Apply with clear details',
        description:
          'Submit your request and keep your application status visible without chasing updates manually.',
        icon: <FileText size={22} />,
      },
      {
        title: 'Sign digitally and move in',
        description:
          'Review lease terms, sign securely, and keep your contract history easy to access anytime.',
        icon: <KeyRound size={22} />,
      },
      {
        title: 'Pay rent and request maintenance',
        description:
          'Handle payments, report issues, and track maintenance progress from one tenant dashboard.',
        icon: <Wrench size={22} />,
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        title: 'Simple property discovery',
        description: 'Find relevant listings quickly with structured filters and clearer listing details.',
        icon: <Home size={20} />,
      },
      {
        title: 'Clear payment visibility',
        description: 'Track upcoming and completed rent activity with less confusion.',
        icon: <CreditCard size={20} />,
      },
      {
        title: 'Faster communication',
        description: 'Keep landlord conversations and updates in one place.',
        icon: <MessageSquare size={20} />,
      },
      {
        title: 'Safer workflows',
        description: 'Tenant data and rental workflows are handled with privacy-aware design.',
        icon: <GlobeLock size={20} />,
      },
    ],
    []
  );

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: 'apply',
        question: 'How do I apply for a property?',
        answer:
          'Open a listing, review the details, and submit an application. You can follow the request status from your tenant dashboard.',
      },
      {
        id: 'payment',
        question: 'Can I track rent payments on HOMi?',
        answer:
          'Yes. HOMi gives you visibility into payment activity so you always know what is due and what has already been processed.',
      },
      {
        id: 'maintenance',
        question: 'How do maintenance requests work?',
        answer:
          'You can submit requests directly in the app and monitor updates until the issue is resolved.',
      },
      {
        id: 'contracts',
        question: 'Where can I find my lease details?',
        answer:
          'Your lease-related information stays centralized so you can review terms and references whenever needed.',
      },
    ],
    []
  );

  return (
    <div className={`how-page-layout ${hideSidebar ? 'how-page-layout--no-sidebar' : ''}`}>
      {!hideSidebar && <Sidebar />}

      <div className="how-main-content">
        {hideSidebar ? <GuestNavbar /> : <Header />}

        <main className="how-content" aria-label="How HOMi works for tenants">
          <section className="how-hero">
            <div className="how-hero-bg" aria-hidden="true" />

            <div className="how-hero-inner">
              <span className="how-badge">How it works</span>
              <h1>
                Find, apply, and rent—<span>all in one place</span>
              </h1>
              <p>
                HOMi helps tenants discover the right home, track applications, pay rent, and handle maintenance with less friction.
              </p>

              <div className="how-cta-row">
                {isSignedIn ? (
                  <Link to="/browse-properties" className="how-btn-primary">
                    Explore properties
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="how-btn-primary"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Explore properties
                  </button>
                )}
                <Link to="/get-help" className="how-btn-secondary">
                  See tenant support
                </Link>
              </div>

              <div className="how-hero-metrics" aria-label="Quick highlights">
                <div className="metric-pill">
                  <CheckCircle2 size={16} />
                  <span>Application visibility</span>
                </div>
                <div className="metric-pill">
                  <CheckCircle2 size={16} />
                  <span>Easy payment tracking</span>
                </div>
                <div className="metric-pill">
                  <CheckCircle2 size={16} />
                  <span>Maintenance updates</span>
                </div>
              </div>
            </div>
          </section>

          <section className="how-section how-steps" aria-label="Step by step">
            <div className="how-container">
              <div className="how-section-head">
                <h2>5 steps for a smoother tenant journey</h2>
                <p>From first search to move-in management, each step is designed to save time.</p>
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
                <h2>Built for day-to-day tenant life</h2>
                <p>Everything needed to stay organized before and after move-in.</p>
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
                  <h3>Transparent from search to signature</h3>
                  <p>
                    Keep your rental process structured, with clearer updates and easier access to the details that matter.
                  </p>
                </div>

                <div className="how-callout how-callout--secondary">
                  <div className="how-callout-icon" aria-hidden="true">
                    <MessageSquare size={20} />
                  </div>
                  <h3>Resolve issues faster</h3>
                  <p>
                    Use centralized communication and request tracking to avoid missed updates and long follow-ups.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="how-section how-faq" aria-label="FAQ">
            <div className="how-container">
              <div className="how-section-head">
                <h2>Tenant FAQ</h2>
                <p>Quick answers before you get started.</p>
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
                Not sure where to begin? Start by browsing properties, then apply to your best matches.
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
                  <h2>Ready to rent with less stress?</h2>
                  <p>
                    Create your tenant account to discover properties, apply confidently, track payments, and manage maintenance.
                  </p>
                </div>
                <div className="how-final-actions">
                  <Link to="/auth" className="how-btn-primary how-btn-primary--big">
                    Create tenant account
                  </Link>
                  {isSignedIn ? (
                    <Link to="/browse-properties" className="how-btn-secondary how-btn-secondary--big">
                      Browse properties
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="how-btn-secondary how-btn-secondary--big"
                      onClick={() => setShowAuthModal(true)}
                    >
                      Browse properties
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {showAuthModal ? <AuthModal onClose={() => setShowAuthModal(false)} /> : null}
    </div>
  );
};

export default ForTenants;


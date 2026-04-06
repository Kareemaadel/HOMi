import React from 'react';
import Header from '../../../components/global/header';
import TenantSidebar from '../../../components/global/Tenant/sidebar';
import LandlordSidebar from '../../../components/global/Landlord/sidebar';
import Footer from '../../../components/global/footer';
import authService from '../../../services/auth.service';
import { Sparkles, Rocket, ShieldCheck, BellRing } from 'lucide-react';
import './HomiPlusComingSoon.css';

const HomiPlusComingSoon: React.FC = () => {
  const role = authService.getCurrentUser()?.user?.role;
  const SidebarComponent = role === 'LANDLORD' ? LandlordSidebar : TenantSidebar;

  return (
    <div className="homi-plus-layout">
      <SidebarComponent />

      <div className="homi-plus-main-content">
        <Header />

        <main className="homi-plus-page">
          <section className="homi-plus-hero">
            <div className="homi-plus-badge">
              <Sparkles size={16} /> HOMI PRO
            </div>

            <h1>HOMI PRO is launching soon</h1>
            <p>
              We are building premium tools for advanced rental growth, automation,
              and smarter insights. You will be first to know when it goes live.
            </p>

            <button type="button" className="homi-plus-notify-btn">
              <BellRing size={16} /> Notify Me
            </button>
          </section>

          <section className="homi-plus-feature-grid">
            <article className="homi-plus-feature-card">
              <div className="homi-plus-feature-icon">
                <Rocket size={20} />
              </div>
              <h3>Priority Listing Boost</h3>
              <p>Get better visibility in search and reach qualified renters faster.</p>
            </article>

            <article className="homi-plus-feature-card">
              <div className="homi-plus-feature-icon">
                <ShieldCheck size={20} />
              </div>
              <h3>Advanced Verification</h3>
              <p>Stronger identity and trust layers for safer tenant-landlord matching.</p>
            </article>

            <article className="homi-plus-feature-card">
              <div className="homi-plus-feature-icon">
                <Sparkles size={20} />
              </div>
              <h3>AI Portfolio Insights</h3>
              <p>Understand pricing opportunities and occupancy trends at a glance.</p>
            </article>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomiPlusComingSoon;

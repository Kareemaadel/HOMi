import React, { useState } from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import { 
  Search, 
  MessageSquare, 
  BookOpen, 
  LifeBuoy, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  CreditCard,
  Mail,
  PhoneCall
} from 'lucide-react';
import './GetHelp.css';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const GetHelp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { id: 'All', icon: <LifeBuoy size={18} /> },
    { id: 'Payments', icon: <CreditCard size={18} /> },
    { id: 'Security', icon: <ShieldCheck size={18} /> },
    { id: 'Lease', icon: <FileText size={18} /> },
  ];

  const faqs: FAQItem[] = [
    {
      category: 'Payments',
      question: 'How do I set up automatic rent payments?',
      answer: 'Navigate to the Payments tab in your dashboard, select "Auto-Pay", and link your preferred bank account or card.'
    },
    {
      category: 'Security',
      question: 'Is my personal data encrypted?',
      answer: 'Yes, we use AES-256 bank-level encryption to ensure all tenant and landlord documentation is fully secured.'
    },
    {
      category: 'Lease',
      question: 'Can I sign my lease digitally?',
      answer: 'Absolutely. RentBlue integrates with secure e-signature providers to allow full digital contract execution.'
    }
  ];

  return (
    <div className="help-page-layout">
      <Sidebar />
      
      <div className="help-main-content">
        <Header />

        {/* Search Hero */}
        <section className="help-hero">
          <div className="help-hero-inner">
            <h1>How can we <span>help you</span> today?</h1>
            <p>Search our knowledge base or browse categories below</p>
            <div className="search-container">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, and more..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">Search</button>
            </div>
          </div>
        </section>

        <div className="help-container">
          {/* Support Channels */}
          <div className="support-channels">
            <div className="channel-card">
              <div className="channel-icon chat"><MessageSquare /></div>
              <h3>Live Chat</h3>
              <p>Average response: 5 mins</p>
              <button className="channel-link">Start Chat <ChevronRight size={16} /></button>
            </div>
            <div className="channel-card">
              <div className="channel-icon documentation"><BookOpen /></div>
              <h3>Documentation</h3>
              <p>Step-by-step platform guides</p>
              <button className="channel-link">Browse Docs <ChevronRight size={16} /></button>
            </div>
            <div className="channel-card">
              <div className="channel-icon contact"><Mail /></div>
              <h3>Email Support</h3>
              <p>Get a reply within 24 hours</p>
              <button className="channel-link">Submit Ticket <ChevronRight size={16} /></button>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="faq-section">
            <div className="faq-header">
              <h2>Frequently Asked Questions</h2>
              <div className="category-tabs">
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.icon} {cat.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="faq-grid">
              {faqs.filter(f => activeCategory === 'All' || f.category === activeCategory).map((faq, i) => (
                <div key={i} className="faq-card">
                  <h4>{faq.question}</h4>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Urgent Contact */}
          <section className="urgent-contact">
            <div className="urgent-banner">
              <div className="urgent-info">
                <PhoneCall className="urgent-icon" />
                <div>
                  <h3>Emergency Maintenance?</h3>
                  <p>For urgent property issues, please call our 24/7 hotline directly.</p>
                </div>
              </div>
              <a href="tel:+1800RENTBLUE" className="hotline-number">+1 (800) RENT-BLUE</a>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default GetHelp;
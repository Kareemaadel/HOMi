import React from 'react';
import Header from '../../../components/global/header';
import Sidebar from '../../../components/global/Tenant/sidebar';
import Footer from '../../../components/global/footer';
import { Shield, Rocket, Github, Linkedin, Quote, Calendar } from 'lucide-react';
import './AboutUs.css';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  socials: { github?: string; linkedin?: string; email?: string; };
}

const AboutUs: React.FC = () => {
const devTeam: TeamMember[] = [
    {
      id: 1,
      name: "Mohy Eldeen",
      role: "Chief Technology Officer",
      image: "/mohyy.jpeg",
      bio: "Leading technical strategy and architecting high-performance SaaS solutions.",
      socials: { github: "#", linkedin: "#", email: "mohy@rentblue.com" }
    },
    {
      id: 2,
      name: "Yehia Hesham",
      role: "Lead Systems Architect",
      image: "/yehia.jpeg",
      bio: "Expert in scalable infrastructure and ensuring robust system reliability.",
      socials: { github: "#", linkedin: "#" }
    },
    {
      id: 3,
      name: "Kareem El7a2i2y",
      role: "Senior Fullstack Engineer",
      image: "/kareem.jpeg",
      bio: "Specializing in seamless API integrations and dynamic user interfaces.",
      socials: { github: "#", email: "kareem@rentblue.com" }
    },
    {
      id: 4,
      name: "Haneen Elghawy",
      role: "Lead UI/UX Designer",
      image: "/Hanen.jpeg",
      bio: "Crafting intuitive digital experiences focused on user-centric design.",
      socials: { linkedin: "#", github: "#" }
    }
  ];

  const journeySteps = [
    { year: "2024", title: "The Spark", desc: "RentBlue was founded in a small garage with a vision to automate rental contracts." },
    { year: "2025", title: "Seed Growth", desc: "Secured $2M in funding and expanded to 10 major metropolitan cities." },
    { year: "2026", title: "Smart Matching", desc: "Launched our proprietary AI matching algorithm for tenants and landlords." }
  ];

  const testimonials = [
    { name: "Marcus Thorne", role: "Property Manager", quote: "RentBlue changed how I manage my 50+ units. The automation is flawless." },
    { name: "Sophia Lang", role: "Tenant", quote: "Found my dream apartment in 2 days. The verification process gave me total peace of mind." }
  ];

  return (
    <div className="about-page-layout">
      <Sidebar  />
      
      <div className="about-main-content">
        <Header />
        
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-overlay">
            <span className="badge">Our Journey</span>
            <h1>Modernizing the way <br /><span>The world rents.</span></h1>
            <p>We're a team of engineers, designers, and real estate experts dedicated to removing the friction from property management.</p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-grid">
              <div className="mission-text">
                <h2>Our Mission</h2>
                <p>Founded with a simple question: Why is renting so hard? Today, we provide a unified SaaS platform that connects landlords and tenants with transparency.</p>
                <div className="stats-row">
                  <div className="stat-item"><h3>10k+</h3><p>Active Users</p></div>
                  <div className="stat-item"><h3>$2M+</h3><p>Processed</p></div>
                </div>
              </div>
              <div className="values-grid">
                <div className="value-card">
                  <Shield className="value-icon" />
                  <h4>Trust First</h4>
                  <p>Verified listings and secure payments are our backbone.</p>
                </div>
                <div className="value-card">
                  <Rocket className="value-icon" />
                  <h4>Innovation</h4>
                  <p>Redefining property management through modern tech.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey/Timeline Section */}
        <section className="journey-section">
          <div className="container">
            <div className="section-header">
              <h2>Our Roadmap</h2>
              <p>How we got here and where we're going.</p>
            </div>
            <div className="timeline-container">
              {journeySteps.map((step, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot"><Calendar size={16} /></div>
                  <div className="timeline-content">
                    <span className="timeline-year">{step.year}</span>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="container">
            <div className="section-header">
              <h2>Meet the Architects</h2>
              <p>The minds behind the code and the vision.</p>
            </div>
            <div className="team-grid">
              {devTeam.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-image">
                    <img src={member.image} alt={member.name} />
                    <div className="social-overlay">
                      <a href="#"><Github size={20}/></a>
                      <a href="#"><Linkedin size={20}/></a>
                    </div>
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <span className="member-role">{member.role}</span>
                    <p>{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="container">
            <div className="testimonials-grid">
              {testimonials.map((t, i) => (
                <div key={i} className="testimonial-card">
                  <Quote className="quote-icon" size={40} />
                  <p>"{t.quote}"</p>
                  <div className="testimonial-author">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta">
          <div className="cta-card">
            <h2>Want to join our team?</h2>
            <p>We're always looking for talented developers and property specialists.</p>
            <button className="btn-primary-about">View Openings</button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default AboutUs;
import { useState } from 'react';
import SignIn from '../components/signin.tsx';
import SignUp from '../components/signup.tsx';
import { GoogleLoginBtn } from '../components/GoogleLoginBtn.tsx';
import { FaFacebookF } from "react-icons/fa";
import './authPage.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  const heroImageUrl = "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="auth-split-wrapper">
      {/* Visual Side */}
      <div className="auth-hero-side">
        <img
          src={heroImageUrl}
          alt="Luxury Architecture"
          className="hero-img-full"
        />
        <div className="hero-text-overlay">
          <div className="glass-badge">Premium Living</div>
          <h2>Discover the art of <br /><span>Modern Living.</span></h2>
          <p>The most exclusive properties at your fingertips.</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-content-container">
          <header className="auth-brand-header">
            <img src="/logo.png" alt="Logo" className="auth-main-logo" />
            <h1>{activeTab === "signin" ? "Welcome back" : "Get started"}</h1>
            <p>Please enter your details to continue</p>
          </header>

          <div className="social-auth-grid">
            <GoogleLoginBtn />
            <button className="social-pill" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <FaFacebookF size={18} color="#1877f2" />
              <span>Facebook (Coming Soon)</span>
            </button>
          </div>

          <div className="auth-ui-divider">
            <span>or email</span>
          </div>

          <div className="tab-switcher">
            <div className={`tab-glow-bg ${activeTab === "signup" ? "slide-right" : ""}`} />
            <button 
              className={activeTab === "signin" ? "active" : ""} 
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button 
              className={activeTab === "signup" ? "active" : ""} 
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <div className="form-fade-in">
            {activeTab === "signin" ? <SignIn /> : <SignUp />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
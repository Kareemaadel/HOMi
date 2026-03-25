import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignIn from '../components/signin.tsx';
import SignUp from '../components/signup.tsx';
import { GoogleLoginBtn } from '../components/GoogleLoginBtn.tsx';
import { FaFacebookF } from "react-icons/fa";
import { authService } from '../../../services/auth.service';
import './authPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  /** Shared for email sign-in and Google — single checkbox lives on the Sign In form. */
  const [rememberMe, setRememberMe] = useState(false);
  /** false until we know there is no restorable session (logout clears tokens). */
  const [sessionResolved, setSessionResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ok = await authService.tryRestoreSession();
      if (cancelled) return;
      if (ok) {
        const cached = authService.getCurrentUser();
        if (cached?.user?.role === 'TENANT') {
          navigate('/', { state: { next: '/tenant-home', force: true }, replace: true });
        } else if (cached?.user?.role === 'LANDLORD') {
          navigate('/', { state: { next: '/landlord-home', force: true }, replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }
      setSessionResolved(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const heroImageUrl = "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=80";

  if (!sessionResolved) {
    return (
      <div className="auth-split-wrapper" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--auth-text-muted)', fontSize: 15 }}>Loading…</p>
      </div>
    );
  }

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
            <GoogleLoginBtn rememberMe={rememberMe} />
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
            {activeTab === "signin" ? (
              <SignIn rememberMe={rememberMe} onRememberMeChange={setRememberMe} />
            ) : (
              <SignUp />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
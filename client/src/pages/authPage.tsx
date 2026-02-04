import { useState, useEffect } from 'react';
import SignIn from '../components/auth/signin.tsx';
import SignUp from '../components/auth/signup.tsx';
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import './authPage.css';
import { Home, Mail, Lock } from 'lucide-react';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
      </div>

      <div className="auth-container">
        <div className="auth-hero">
          <img
            src="/rentblue.jpg"
            alt="Welcome home"
          />
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-box">
              <img src="/logo.png" alt="Logo" />
            </div>
            
            <p>Sign in to your account or create a new one</p>
          </div>

          <div className="social-buttons">
            <button className="social-btn google">
              <FcGoogle size={20} />
              Continue with Google
            </button>
            <button className="social-btn facebook">
              <FaFacebookF size={18} />
              Continue with Facebook
            </button>
          </div>

          <div className="divider">Or continue with email</div>

          <div className="tabs">
            <div
              className={`tab-slider ${activeTab === "signup" ? "right" : ""}`}
            />
            <button onClick={() => setActiveTab("signin")}>Sign In</button>
            <button onClick={() => setActiveTab("signup")}>Sign Up</button>
          </div>

          {activeTab === "signin" ? <SignIn /> : <SignUp />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
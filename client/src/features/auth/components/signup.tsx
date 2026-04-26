import React, { useState } from 'react';
import { Mail, Lock, User, UserPlus, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const [strength, setStrength] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const checkStrength = (value: string) => {
    let score = 0;
    if (value.length > 6) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    setStrength(score);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (name === 'password') {
      checkStrength(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!agreeToTerms) {
      setFormError(t('auth.agreeToTermsError'));
      return;
    }

    // Must match the backend RegisterSchema password regex exactly
    // eslint-disable-next-line no-useless-escape -- mirrors server Joi pattern literally
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setFormError(t('auth.passwordRequirementError'));
      return;
    }

    // Store signup data in sessionStorage to be used in CompleteProfile
    sessionStorage.setItem('signupData', JSON.stringify(formData));
    navigate("/complete-profile");
  };

  return (
    <form className="form-layout-v2" onSubmit={handleSubmit}>
      {formError && (
        <div style={{
          padding: '10px 14px', marginBottom: 12,
          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
          borderRadius: 8, fontSize: 13, fontWeight: 500,
          border: '1px solid rgba(239,68,68,0.3)',
        }}>{formError}</div>
      )}
      <div className="input-row">
        <div className="input-block">
          <User size={18}/>
          <input 
            type="text" 
            name="firstName"
            placeholder={t('auth.firstName')} 
            value={formData.firstName}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="input-block">
          <User size={18}/>
          <input 
            type="text"
            name="lastName" 
            placeholder={t('auth.lastName')} 
            value={formData.lastName}
            onChange={handleChange}
            required 
          />
        </div>
      </div>

      <div className="input-block">
        <Mail size={18}/>
        <input 
          type="email" 
          name="email"
          placeholder={t('auth.email')} 
          value={formData.email}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="input-block">
        <PhoneCall size={18}/>
        <input 
          type="tel" 
          name="phone"
          placeholder={t('auth.phone')} 
          value={formData.phone}
          onChange={handleChange}
          required 
        />
      </div>

      <div className="input-block">
        <Lock size={18}/>
        <input 
          type="password" 
          name="password"
          placeholder={t('auth.password')} 
          value={formData.password}
          onChange={handleChange}
          required 
        />
      </div>

      {/* Strength Indicator */}
      <div className="strength-meter">
        <div className={`strength-fill s-${strength}`} />
      </div>

      <label className="remember-me-label terms-agree-label">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
        />
        <span className="remember-me-text">
          {t('auth.agreeToTerms')}{' '}
          <a href="#terms" className="terms-inline-link">{t('auth.termsAndConditions')}</a>
        </span>
      </label>

      <button type="submit" className="btn-primary-v2">
        <UserPlus size={18}/> 
        <span>{t('auth.signUp')}</span>
      </button>
    </form>
  );
};

export default SignUp;
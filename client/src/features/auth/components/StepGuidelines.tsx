import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function StepGuidelines({ onNext }: { onNext: () => void }) {
  const [agreed, setAgreed] = useState(false);

  const guidelines = [
    { icon: '🏠', title: 'Respect Properties', desc: 'Treat rental properties with care and respect' },
    { icon: '👥', title: 'Be Respectful', desc: 'Maintain positive relationships with landlords and neighbors' },
    { icon: '📋', title: 'Follow Rules', desc: 'Adhere to platform policies and local regulations' },
    { icon: '💬', title: 'Communication', desc: 'Respond promptly to messages and maintain open dialogue' },
    { icon: '💰', title: 'Payment', desc: 'Pay rent on time and handle finances responsibly' },
    { icon: '🔒', title: 'Privacy', desc: 'Respect privacy and protect personal information' }
  ];

  return (
    <div className="step">
      <h2>📋 Community Guidelines</h2>
      <p style={{color: '#666', marginBottom: '25px'}}>Please review and accept our community guidelines</p>
      
      <div className="guidelines-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        {guidelines.map((g, i) => (
          <div key={i} style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            textAlign: 'center',
            background: '#f9f9f9'
          }}>
            <div style={{fontSize: '28px', marginBottom: '8px'}}>{g.icon}</div>
            <h4 style={{margin: '0 0 5px 0', color: '#333', fontSize: '14px'}}>{g.title}</h4>
            <p style={{margin: '0', color: '#666', fontSize: '12px'}}>{g.desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(251, 146, 60, 0.1)',
        border: '1px solid rgba(251, 146, 60, 0.3)',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <p style={{margin: '0', color: '#333', fontSize: '14px'}}>
          ⚠️ Violation of these guidelines may result in account suspension or removal from the platform.
        </p>
      </div>

      <label className="checkbox" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        cursor: 'pointer',
        marginBottom: '20px'
      }}>
        <input 
          type="checkbox" 
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          required 
        />
        <span style={{color: '#333'}}>I have read and agree to follow the community guidelines</span>
      </label>

      <button 
        onClick={onNext} 
        disabled={!agreed}
        className="primary-btn"
        style={{opacity: agreed ? 1 : 0.5}}
      >
        Continue
      </button>
    </div>
  );
}

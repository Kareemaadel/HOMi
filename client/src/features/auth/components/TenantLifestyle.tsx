import { useState } from 'react';

const options = [
  { label: 'Non-smoker', icon: '🚭' },
  { label: 'Pet friendly', icon: '🐕' },
  { label: 'Early sleeper', icon: '🌙' },
  { label: 'Social', icon: '👥' },
  { label: 'Quiet', icon: '🤫' },
  { label: 'Cooking enthusiast', icon: '👨‍🍳' },
  { label: 'Fitness lover', icon: '💪' },
  { label: 'Work from home', icon: '💻' }
];

export default function TenantLifestyle({ onNext }: { onNext:()=>void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (label: string) => {
    setSelected(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="step">
      <h2>🎯 Your Lifestyle Preferences</h2>
      <p style={{color: '#666', marginBottom: '25px'}}>Help us match you with compatible living situations</p>
      
      <div className="tags" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '25px'
      }}>
        {options.map(o => (
          <button
            key={o.label}
            onClick={() => toggleOption(o.label)}
            className={`lifestyle-tag`}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              border: selected.includes(o.label) ? '2px solid #2563eb' : '2px solid #ddd',
              background: selected.includes(o.label) ? 'rgba(37, 99, 235, 0.1)' : '#fff',
              color: '#333',
              cursor: 'pointer',
              transition: '0.2s',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center'
            }}
          >
            <span>{o.icon}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>

      <div style={{
        background: '#f0f9ff',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        color: '#333'
      }}>
        <p style={{margin: '0', fontSize: '14px'}}>
          Selected: <strong>{selected.length > 0 ? selected.join(', ') : 'None yet'}</strong>
        </p>
      </div>

      <button onClick={onNext} className="primary-btn">
        Next
      </button>
    </div>
  );
}

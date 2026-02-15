import { useState } from 'react';
import { CheckCircle, Upload, Camera } from 'lucide-react';

export default function StepAvatarFinish() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDashboard = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div className="step center">
      <div style={{textAlign: 'center'}}>
        <div style={{fontSize: '60px', marginBottom: '20px'}}>🎉</div>
        <h2>You're All Set!</h2>
        <p style={{color: '#666', marginBottom: '30px'}}>Your profile is complete. Add a profile picture to personalize your account.</p>
        
        <div className="avatar-section" style={{margin: '30px 0'}}>
          {avatar ? (
            <div className="avatar-preview">
              <img src={avatar} alt="Profile" style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #2563eb'
              }} />
            </div>
          ) : (
            <div className="avatar-placeholder" style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <Camera size={40} color="#2563eb" />
            </div>
          )}
        </div>

        <label style={{display: 'inline-block', marginBottom: '20px'}}>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload}
            style={{display: 'none'}}
          />
          <span className="primary-btn" style={{display: 'inline-block', cursor: 'pointer'}}>
            <Upload size={18} style={{marginRight: '8px'}} />
            Choose Photo
          </span>
        </label>

        <div style={{
          background: 'rgba(37, 99, 235, 0.1)',
          padding: '15px',
          borderRadius: '10px',
          margin: '20px 0',
          color: '#333'
        }}>
          <p style={{fontSize: '14px', margin: '0'}}>✓ Profile setup complete</p>
          <p style={{fontSize: '14px', margin: '5px 0 0'}}>✓ Ready to connect with renters</p>
        </div>

        <button 
          className="primary-btn" 
          onClick={handleDashboard}
          disabled={isLoading}
          style={{marginTop: '20px'}}
        >
          {isLoading ? 'Loading...' : '→ Go to Dashboard'}
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../config/api';
import './adminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiClient.post('/admin/auth/login', { email, password });
            
            if (response.data.success) {
                const { accessToken, user, profile } = response.data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                if (profile) {
                    localStorage.setItem('profile', JSON.stringify(profile));
                } else {
                    localStorage.removeItem('profile');
                }
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Are you an admin?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <div className="admin-login-header">
                    <h2>HOMi <span>Admin</span></h2>
                    <p>Secure System Access</p>
                </div>
                
                {error && <div className="admin-error-message">{error}</div>}
                
                <form onSubmit={handleLogin} className="admin-login-form">
                    <div className="form-group">
                        <label>Admin Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@homi.app"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Master Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="admin-login-btn">
                        {loading ? 'Authenticating...' : 'Enter System'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
